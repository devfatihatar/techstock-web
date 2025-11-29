const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// 🔹 SATIŞLARI LİSTELE
router.get("/", auth, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { companyId: req.company.id },
      orderBy: { date: "desc" },
      include: {
        product: true,
      },
    });

    res.json(sales);
  } catch (err) {
    console.error("Satışlar alınırken sunucu hatası:", err);
    res.status(500).json({ message: "Satışlar alınırken hata oluştu" });
  }
});

// 🔹 YENİ SATIŞ EKLE (stok düşürerek)
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity, price, customer } = req.body;

    if (!productId || !price) {
      return res
        .status(400)
        .json({ message: "Ürün ve fiyat alanları zorunludur." });
    }

    const qty = quantity ? Number(quantity) : 1;
    const unitPrice = Number(price);

    // Ürün gerçekten bu firmaya mı ait, stok yeterli mi?
    const product = await prisma.product.findFirst({
      where: { id: Number(productId), companyId: req.company.id },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Ürün bulunamadı veya bu firmaya ait değil." });
    }

    if (product.quantity != null && product.quantity < qty) {
      return res.status(400).json({
        message: `Yeterli stok yok. Mevcut stok: ${product.quantity}`,
      });
    }

    // Transaction: stok düş + satış kaydet
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          quantity:
            product.quantity != null ? product.quantity - qty : product.quantity,
        },
      });

      const sale = await tx.sale.create({
        data: {
          companyId: req.company.id,
          productId: product.id,
          quantity: qty,
          price: unitPrice,
          customer: customer || null,
          date: new Date(),
        },
        include: {
          product: true,
        },
      });

      return { sale, updatedProduct };
    });

    res.status(201).json(result.sale);
  } catch (err) {
    console.error("Satış kaydı oluşturulurken sunucu hatası:", err);
    res.status(500).json({ message: "Satış kaydı oluşturulurken hata oluştu" });
  }
});

module.exports = router;
