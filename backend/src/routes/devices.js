const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Tüm cihazlar (sadece kendi firmasınınkiler)
router.get("/", auth, async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        companyId: req.company.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cihazlar alınırken hata oluştu" });
  }
});

// Yeni cihaz ekle
router.post("/", auth, async (req, res) => {
  try {
    const {
      customerName,
      phone,
      type,
      brand,
      model,
      serialNumber,
      description,
      status,
    } = req.body;

    if (!customerName || !type) {
      return res
        .status(400)
        .json({ message: "Müşteri adı ve cihaz türü zorunludur." });
    }

    const device = await prisma.device.create({
      data: {
        companyId: req.company.id,
        customerName,
        phone,
        type,
        brand,
        model,
        serialNumber,
        description,
        status: status || "Serviste",
        deliveredAt:
          status === "Teslim Edildi" ? new Date().toISOString() : null,
      },
    });

    res.status(201).json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cihaz eklenirken hata oluştu" });
  }
});

// Cihaz güncelle
router.put("/:id", auth, async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id, 10);
    const {
      customerName,
      phone,
      type,
      brand,
      model,
      serialNumber,
      description,
      status,
    } = req.body;

    const existing = await prisma.device.findFirst({
      where: { id: deviceId, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Cihaz bulunamadı" });
    }

    let deliveredAt = existing.deliveredAt;
    if (status === "Teslim Edildi" && !existing.deliveredAt) {
      deliveredAt = new Date().toISOString();
    }
    if (status !== "Teslim Edildi") {
      deliveredAt = null;
    }

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: {
        customerName,
        phone,
        type,
        brand,
        model,
        serialNumber,
        description,
        status,
        deliveredAt,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cihaz güncellenirken hata oluştu" });
  }
});

// (İstersen buraya delete de ekleyebiliriz)
module.exports = router;
