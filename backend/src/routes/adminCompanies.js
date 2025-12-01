// src/routes/adminCompanies.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

// Basit JWT doğrulama (şimdilik rol kontrolü yok, istersen ekleriz)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yetkisiz. Token bulunamadı." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res
      .status(401)
      .json({ message: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." });
  }
}

// Tüm istekler önce auth’tan geçsin
router.use(requireAuth);

// Küçük yardımcı: passwordHash’i response’tan çıkar + modules string -> object
function normalizeCompany(company) {
  const { passwordHash, ...rest } = company;

  // modules: DB'de STRING, frontend'de OBJECT olarak kullan
  try {
    rest.modules = rest.modules ? JSON.parse(rest.modules) : {};
  } catch (e) {
    console.error("modules JSON parse error:", e);
    rest.modules = {};
  }

  return rest;
}

// GET /api/admin/companies  -> tüm firmalar
router.get("/companies", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { id: "asc" },
    });
    res.json(companies.map(normalizeCompany));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Firmalar getirilirken hata oluştu." });
  }
});

// POST /api/admin/companies  -> yeni firma
router.post("/companies", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contactPerson,
      phone,
      username,
      isActive = true,
      modules = {},
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "İsim, e-posta ve şifre zorunludur." });
    }

    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Bu e-posta ile zaten bir firma mevcut." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.company.create({
      data: {
        name,
        email,
        passwordHash,
        contactPerson,
        phone,
        username,
        isActive,
        // 🔥 SQLite'ta Json yok, STRING saklıyoruz
        modules: JSON.stringify(modules || {}),
      },
    });

    res.json(normalizeCompany(created));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Firma oluşturulurken hata oluştu." });
  }
});

// PUT /api/admin/companies/:id  -> firma güncelle
router.put("/companies/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      email,
      password,
      contactPerson,
      phone,
      username,
      isActive = true,
      modules = {},
    } = req.body;

    const data = {
      name,
      email,
      contactPerson,
      phone,
      username,
      isActive,
      // 🔥 yine STRING olarak saklıyoruz
      modules: JSON.stringify(modules || {}),
    };

    // Şifre gönderilmişse güncelle
    if (password && password.trim().length > 0) {
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.company.update({
      where: { id },
      data,
    });

    res.json(normalizeCompany(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Firma güncellenirken hata oluştu." });
  }
});

// DELETE /api/admin/companies/:id  -> firma sil
router.delete("/companies/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.company.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Firma silinirken hata oluştu." });
  }
});

module.exports = router;
