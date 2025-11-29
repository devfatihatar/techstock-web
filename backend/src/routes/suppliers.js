const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// 🔹 Tedarikçileri listele
router.get("/", auth, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { companyId: req.company.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(suppliers);
  } catch (err) {
    console.error("Tedarikçiler alınırken sunucu hatası:", err);
    res.status(500).json({ message: "Tedarikçiler alınırken hata oluştu" });
  }
});

// 🔹 Yeni tedarikçi ekle
router.post("/", auth, async (req, res) => {
  try {
    const { name, contactName, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tedarikçi adı zorunludur." });
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyId: req.company.id,
        name,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
      },
    });

    res.status(201).json(supplier);
  } catch (err) {
    console.error("Tedarikçi eklenirken sunucu hatası:", err);
    res.status(500).json({ message: "Tedarikçi eklenirken hata oluştu" });
  }
});

// 🔹 Tedarikçi güncelle
router.put("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, contactName, phone, email, address, notes } = req.body;

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Tedarikçi bulunamadı" });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        contactName: contactName ?? existing.contactName,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        address: address ?? existing.address,
        notes: notes ?? existing.notes,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Tedarikçi güncellenirken sunucu hatası:", err);
    res.status(500).json({ message: "Tedarikçi güncellenirken hata oluştu" });
  }
});

// 🔹 Tedarikçi sil
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Tedarikçi bulunamadı" });
    }

    await prisma.supplier.delete({ where: { id } });

    res.json({ message: "Tedarikçi silindi" });
  } catch (err) {
    console.error("Tedarikçi silinirken sunucu hatası:", err);
    res.status(500).json({ message: "Tedarikçi silinirken hata oluştu" });
  }
});

module.exports = router;
