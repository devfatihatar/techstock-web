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

    // Transaction: ürün oluştur + ilk stok hareketi + fiyat geçmişi
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          companyId: req.company.id,
          name,
          quantity: qty,
          buyPrice: price,
          supplier: supplier || null,
        },
      });

      // 🔹 Başlangıç stoğu varsa stoğa giriş hareketi kaydet
      if (qty > 0) {
        await tx.stockMovement.create({
          data: {
            companyId: req.company.id,
            productId: product.id,
            type: "IN",
            quantity: qty,
          },
        });
      }

      // İlk fiyat geçmişi
      if (price !== null) {
        await tx.productPriceHistory.create({
          data: {
            productId: product.id,
            price,
          },
        });
      }

      const withRelations = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          priceHistory: {
            orderBy: { date: "desc" },
          },
        },
      });

      return withRelations;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Ürün eklenirken sunucu hatası:", err);
    res.status(500).json({ message: "Ürün eklenirken hata oluştu" });
  }
});

// 🔹 STOK ARTTIR / AZALT (delta: +n veya -n) + StockMovement
router.patch("/:id/stock", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { delta, isCorrection } = req.body; // 👈 yeni field

    const product = await prisma.product.findFirst({
      where: { id, companyId: req.company.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    const d = Number(delta) || 0;
    if (d === 0) {
      return res.json(product); // değişiklik yoksa dokunma
    }

    const updated = await prisma.$transaction(async (tx) => {
      let newQty = (product.quantity || 0) + d;
      if (newQty < 0) newQty = 0;

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { quantity: newQty },
      });

      // 🔹 Stok hareketi kaydı
      let reason = null;
      if (isCorrection) {
        reason = "CORRECTION";
      } else {
        reason = d > 0 ? "MANUAL_IN" : "MANUAL_OUT";
      }

      await tx.stockMovement.create({
        data: {
          companyId: req.company.id,
          productId: product.id,
          type: d > 0 ? "IN" : "OUT",
          quantity: Math.abs(d),
          reason,
        },
      });

      return updatedProduct;
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

    // İstersen burada stockMovement temizleyebilirsin (opsiyonel)
    // await prisma.stockMovement.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    res.json({ message: "Ürün silindi" });
  } catch (err) {
    console.error("Ürün silinirken sunucu hatası:", err);
    res.status(500).json({ message: "Ürün silinirken hata oluştu" });
  }
});

module.exports = router;
