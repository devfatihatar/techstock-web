const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// 🔹 Listele (sadece bu firmanın tamirleri)
router.get("/", auth, async (req, res) => {
  try {
    const repairs = await prisma.repair.findMany({
      where: { companyId: req.company.id },
      orderBy: { createdAt: "desc" },
      include: {
        device: true, // istersek cihaz bilgisi de gelsin
      },
    });

    res.json(repairs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Tamirler alınırken hata oluştu" });
  }
});

// 🔹 Yeni tamir ekle
router.post("/", auth, async (req, res) => {
  try {
    const {
      deviceId, // opsiyonel ama bizde fiilen zorunlu
      customerName,
      phone, // body'den geliyor ama şu an DB'de kolon yok, kullanmıyoruz
      problem,
      status,
      price,
      notes,
    } = req.body;

    if (!problem) {
      return res
        .status(400)
        .json({ message: "Sorun / arıza açıklaması zorunludur." });
    }

    const parsedDeviceId =
      deviceId !== undefined && deviceId !== null && deviceId !== ""
        ? Number(deviceId)
        : null;

    const parsedPrice =
      price !== undefined && price !== null && price !== ""
        ? Number(price)
        : null;

    const repair = await prisma.repair.create({
      data: {
        companyId: req.company.id,          // 🔴 firma ilişkisi
        deviceId: parsedDeviceId,           // sayı veya null
        problem,
        status: status || "Bekliyor",
        price: parsedPrice,
        notes,
        customerName,
        // phone alanı TABLODA YOK, o yüzden BURAYA YAZMIYORUZ ❌
      },
    });

    res.status(201).json(repair);
  } catch (err) {
    console.error("Tamir kaydı oluşturulurken sunucu hatası:", err);
    res.status(500).json({ message: "Tamir kaydı oluşturulurken hata oluştu" });
  }
});

// 🔹 Tamir güncelle
router.put("/:id", auth, async (req, res) => {
  try {
    const repairId = parseInt(req.params.id, 10);
    const { deviceId, customerName, phone, problem, status, price, notes } =
      req.body;

    const existing = await prisma.repair.findFirst({
      where: { id: repairId, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Tamir kaydı bulunamadı" });
    }

    const updated = await prisma.repair.update({
      where: { id: repairId },
      data: {
        deviceId: deviceId || null,
        customerName,
        // phone alanı tabloya ait değil, o yüzden BURAYA DA yazmıyoruz ❌
        problem,
        status,
        price: price != null ? Number(price) : null,
        notes,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Tamir kaydı güncellenirken sunucu hatası:", err);
    res.status(500).json({ message: "Tamir kaydı güncellenirken hata oluştu" });
  }
});

// 🔹 (Opsiyonel) Tamir sil
router.delete("/:id", auth, async (req, res) => {
  try {
    const repairId = parseInt(req.params.id, 10);

    const existing = await prisma.repair.findFirst({
      where: { id: repairId, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Tamir kaydı bulunamadı" });
    }

    await prisma.repair.delete({ where: { id: repairId } });

    res.json({ message: "Tamir kaydı silindi" });
  } catch (err) {
    console.error("Tamir kaydı silinirken sunucu hatası:", err);
    res.status(500).json({ message: "Tamir kaydı silinirken hata oluştu" });
  }
});

module.exports = router;
