const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());

app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Ürünleri çekerken hata:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Yeni ürün ekle
app.post("/products", async (req, res) => {
  try {
    const {
      name,
      code,
      barcode,
      unit,
      criticalStock,
      currentStock
    } = req.body;

    // Basit kontrol: zorunlu alanlar dolu mu?
    if (!name || !code || !unit || criticalStock == null) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik" });
    }

    // Şimdilik tek firma: Simge Bilgisayar (id: 1)
    const companyId = 1;

    const product = await prisma.product.create({
      data: {
        companyId,
        name,
        code,
        barcode,
        unit,
        criticalStock,
        currentStock: currentStock ?? 0 // gönderilmezse 0 olsun
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Ürün eklerken hata:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Stok hareketi ekle (giriş / çıkış)
app.post("/stock-movements", async (req, res) => {
  try {
    const { productId, type, quantity, description } = req.body;

    // 1) Temel validasyon
    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: "productId, type ve quantity zorunludur" });
    }

    if (type !== "IN" && type !== "OUT") {
      return res.status(400).json({ error: "type sadece 'IN' veya 'OUT' olabilir" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "quantity 0'dan büyük olmalıdır" });
    }

    // Şimdilik tek firma üzerinden gidiyoruz
    const companyId = 1;

    // 2) Ürünü bul
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId: companyId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    // 3) Yeni stok miktarını hesapla
    let newStock = product.currentStock;

    if (type === "IN") {
      newStock = product.currentStock + quantity;
    } else if (type === "OUT") {
      newStock = product.currentStock - quantity;

      if (newStock < 0) {
        return res.status(400).json({ error: "Yetersiz stok, çıkış yapılamaz" });
      }
    }

    // 4) Transaction ile hareket + stok güncellemesi
    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          companyId,
          productId,
          type,        // "IN" | "OUT" (enum ile uyumlu)
          quantity,
          description,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: newStock,
        },
      }),
    ]);

    return res.status(201).json({
      message: "Stok hareketi başarıyla işlendi",
      movement,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Stok hareketi eklerken hata:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});