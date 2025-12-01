const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma"); // az önce yazdığımız
const router = express.Router();

/**
 * ===========================
 *  COMPANY (MÜŞTERİ) TARAFI
 * ===========================
 */

// Geçici: ilk firma oluşturma için endpoint (Thunder ile kullanıyorsun)
router.post("/seed-company", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Bu email ile zaten firma var" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const company = await prisma.company.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Firma oluşturulurken hata oluştu" });
  }
});

// Company Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, company.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    const token = jwt.sign(
      { companyId: company.id, email: company.email, type: "COMPANY" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Giriş yapılırken bir hata oluştu" });
  }
});

/**
 * ===========================
 *  ADMIN TARAFI (User modeli)
 * ===========================
 */

// Admin oluşturma (Thunder ile kullanmak için)
// POST /api/auth/admin/create
router.post("/admin/create", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Bu email ile zaten admin / kullanıcı var" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        // Prisma'da Role enum'un varsa: role: "ADMIN" bu şekilde JS tarafında çalışır
        role: "ADMIN",
      },
    });

    res.status(201).json({
      message: "Admin oluşturuldu",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin oluşturulurken hata oluştu" });
  }
});

// Admin Login
// POST /api/auth/admin/login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bu kullanıcı admin değil" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, type: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin girişi başarılı",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin girişi sırasında hata oluştu" });
  }
});

module.exports = router;
