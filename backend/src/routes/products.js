const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// 🔹 ÜRÜNLERİ LİSTELE
router.get("/", auth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId: req.company.id },
      orderBy: { createdAt: "desc" },
      include: {
        priceHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    res.json(products);
  } catch (err) {
    console.error("Ürünler alınırken sunucu hatası:", err);
    res.status(500).json({ message: "Ürünler alınırken hata oluştu" });
  }
});

// 🔹 YENİ ÜRÜN EKLE
router.post("/", auth, async (req, res) => {
  try {
    const { name, quantity, buyPrice, supplier } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Ürün adı zorunludur." });
    }

    const qty =
      quantity !== undefined && quantity !== null ? Number(quantity) : 0;
    const price =
      buyPrice !== undefined && buyPrice !== null ? Number(buyPrice) : null;

    const product = await prisma.product.create({
      data: {
        companyId: req.company.id,
        name,
        quantity: qty,
        buyPrice: price,
        supplier: supplier || null,
      },
    });

    // İlk fiyat geçmişi
    if (price !== null) {
      await prisma.productPriceHistory.create({
        data: {
          productId: product.id,
          price,
        },
      });
    }

    const withRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        priceHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    res.status(201).json(withRelations);
  } catch (err) {
    console.error("Ürün eklenirken sunucu hatası:", err);
    res.status(500).json({ message: "Ürün eklenirken hata oluştu" });
  }
});

// 🔹 STOK ARTTIR / AZALT (delta: +1 veya -1)
router.patch("/:id/stock", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { delta } = req.body;

    const product = await prisma.product.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    const d = Number(delta) || 0;
    let newQty = (product.quantity || 0) + d;
    if (newQty < 0) newQty = 0;

    const updated = await prisma.product.update({
      where: { id },
      data: { quantity: newQty },
    });

    res.json(updated);
  } catch (err) {
    console.error("Stok güncellenirken sunucu hatası:", err);
    res.status(500).json({ message: "Stok güncellenirken hata oluştu" });
  }
});

// 🔹 FİYAT GÜNCELLE + FİYAT GEÇMİŞİNE EKLE
router.put("/:id/price", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { buyPrice } = req.body;

    const price =
      buyPrice !== undefined && buyPrice !== null ? Number(buyPrice) : null;

    const product = await prisma.product.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { buyPrice: price },
    });

    if (price !== null) {
      await prisma.productPriceHistory.create({
        data: {
          productId: updated.id,
          price,
        },
      });
    }

    const withRelations = await prisma.product.findUnique({
      where: { id: updated.id },
      include: {
        priceHistory: {
          orderBy: { date: "desc" },
        },
      },
    });

    res.json(withRelations);
  } catch (err) {
    console.error("Fiyat güncellenirken sunucu hatası:", err);
    res.status(500).json({ message: "Fiyat güncellenirken hata oluştu" });
  }
});

// 🔹 ÜRÜN SİL
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.product.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    await prisma.productPriceHistory.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({ where: { id } });

    res.json({ message: "Ürün silindi" });
  } catch (err) {
    console.error("Ürün silinirken sunucu hatası:", err);
    res.status(500).json({ message: "Ürün silinirken hata oluştu" });
  }
});

module.exports = router;
