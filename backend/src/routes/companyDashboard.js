const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

// Sadece firma kullanıcıları için basit auth
function requireCompanyAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yetkisiz. Token bulunamadı." });
  }

  // 🔴 HATALI: const token = authHeader.split("")[1];
  // ✅ DOĞRUSU:
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Login sırasında token'da companyId göndermiştik:
    // jwt.sign({ companyId: company.id, email: company.email }, ...)

    if (!decoded.companyId) {
      return res
        .status(403)
        .json({ message: "Bu endpoint sadece firma kullanıcıları içindir." });
    }

    req.user = decoded; // { companyId, email, ... }
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res
      .status(401)
      .json({ message: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." });
  }
}


router.use(requireCompanyAuth);

// Yardımcı: gün / hafta / ay hesapları
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

const WEEK_LABELS = ["1. Hf", "2. Hf", "3. Hf", "4. Hf"];
const WEEKDAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

//
// 🔹 1) GELİR (SALE ÜZERİNDEN)
//  GET /api/company/dashboard/revenue?range=daily|weekly|monthly&month=YYYY-MM
//
router.get("/dashboard/revenue", async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const range = req.query.range || "daily";
    const monthParam = req.query.month; // "2025-11" gibi

    if (!companyId) {
      return res.status(400).json({ message: "companyId bulunamadı." });
    }

    if (range === "daily") {
      return await handleDailyRevenue(companyId, res);
    } else if (range === "weekly") {
      return await handleWeeklyRevenue(companyId, res);
    } else if (range === "monthly") {
      return await handleMonthlyRevenue(companyId, res, monthParam);
    } else {
      return res.status(400).json({ message: "Geçersiz range değeri." });
    }
  } catch (err) {
    console.error("Revenue dashboard error:", err);
    res
      .status(500)
      .json({ message: "Gelir verileri alınırken bir hata oluştu." });
  }
});

// Son 7 gün (gelir)
async function handleDailyRevenue(companyId, res) {
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  const from = startOfDay(dates[0]);
  const to = endOfDay(today);

  const sales = await prisma.sale.findMany({
    where: {
      companyId,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
  });

  const map = {};
  for (const s of sales) {
    const key = s.createdAt.toISOString().slice(0, 10);
    const amount = s.totalAmount ?? s.price * s.quantity ?? 0; // 🔹 güvenli hesap
    map[key] = (map[key] || 0) + amount;
  }

  const points = dates.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const value = map[key] || 0;
    const label = WEEKDAY_LABELS[d.getDay()];
    return { label, value };
  });

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}

// Son 4 hafta (gelir)
async function handleWeeklyRevenue(companyId, res) {
  const today = new Date();
  const from = startOfDay(new Date(today));
  from.setDate(from.getDate() - 27); // 4 hafta = 28 gün

  const sales = await prisma.sale.findMany({
    where: {
      companyId,
      createdAt: {
        gte: from,
        lte: endOfDay(today),
      },
      NOT: { reason: "CORRECTION" },

    },
  });

  const buckets = [0, 0, 0, 0];

  for (const s of sales) {
    const diffMs = endOfDay(today) - startOfDay(s.createdAt);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weekIndexFromNow = Math.floor(diffDays / 7); // 0..3
    const bucketIndex = 3 - weekIndexFromNow; // 3: bu hafta

    if (bucketIndex >= 0 && bucketIndex <= 3) {
      const amount = s.totalAmount ?? s.price * s.quantity ?? 0;
      buckets[bucketIndex] += amount;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: WEEK_LABELS[idx],
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}

// Aylık (gelir)
async function handleMonthlyRevenue(companyId, res, monthParam) {
  let year, monthIndex;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    monthIndex = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIndex = now.getMonth();
  }

  const start = new Date(year, monthIndex, 1);
  const end = endOfDay(new Date(year, monthIndex + 1, 0));
  const daysInMonth = end.getDate();

  const sales = await prisma.sale.findMany({
    where: {
      companyId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const buckets = new Array(daysInMonth).fill(0);

  for (const s of sales) {
    const day = s.createdAt.getDate();
    const index = day - 1;
    if (index >= 0 && index < daysInMonth) {
      const amount = s.totalAmount ?? s.price * s.quantity ?? 0;
      buckets[index] += amount;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: String(idx + 1),
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}

//
// 🔹 2) TAMİR SAYILARI
//  GET /api/company/dashboard/repairs?range=daily|weekly|monthly&month=YYYY-MM
//
router.get("/dashboard/repairs", async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const range = req.query.range || "daily";
    const monthParam = req.query.month;

    if (!companyId) {
      return res.status(400).json({ message: "companyId bulunamadı." });
    }

    if (range === "daily") {
      return await handleDailyRepairs(companyId, res);
    } else if (range === "weekly") {
      return await handleWeeklyRepairs(companyId, res);
    } else if (range === "monthly") {
      return await handleMonthlyRepairs(companyId, res, monthParam);
    } else {
      return res.status(400).json({ message: "Geçersiz range değeri." });
    }
  } catch (err) {
    console.error("Repairs dashboard error:", err);
    res
      .status(500)
      .json({ message: "Tamir verileri alınırken bir hata oluştu." });
  }
});

// Son 7 gün (tamir adedi)
async function handleDailyRepairs(companyId, res) {
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  const from = startOfDay(dates[0]);
  const to = endOfDay(today);

  const repairs = await prisma.repair.findMany({
    where: {
      companyId,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
  });

  const map = {};
  for (const r of repairs) {
    const key = r.createdAt.toISOString().slice(0, 10);
    map[key] = (map[key] || 0) + 1; // sadece adet sayıyoruz
  }

  const points = dates.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const value = map[key] || 0;
    const label = WEEKDAY_LABELS[d.getDay()];
    return { label, value };
  });

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}

// Son 4 hafta (tamir adedi)
async function handleWeeklyRepairs(companyId, res) {
  const today = new Date();
  const from = startOfDay(new Date(today));
  from.setDate(from.getDate() - 27);

  const repairs = await prisma.repair.findMany({
    where: {
      companyId,
      createdAt: {
        gte: from,
        lte: endOfDay(today),
      },
    },
  });

  const buckets = [0, 0, 0, 0];

  for (const r of repairs) {
    const diffMs = endOfDay(today) - startOfDay(r.createdAt);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weekIndexFromNow = Math.floor(diffDays / 7);
    const bucketIndex = 3 - weekIndexFromNow;

    if (bucketIndex >= 0 && bucketIndex <= 3) {
      buckets[bucketIndex] += 1;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: WEEK_LABELS[idx],
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}

// Aylık (tamir adedi)
async function handleMonthlyRepairs(companyId, res, monthParam) {
  let year, monthIndex;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    monthIndex = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIndex = now.getMonth();
  }

  const start = new Date(year, monthIndex, 1);
  const end = endOfDay(new Date(year, monthIndex + 1, 0));
  const daysInMonth = end.getDate();

  const repairs = await prisma.repair.findMany({
    where: {
      companyId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const buckets = new Array(daysInMonth).fill(0);

  for (const r of repairs) {
    const day = r.createdAt.getDate();
    const index = day - 1;
    if (index >= 0 && index < daysInMonth) {
      buckets[index] += 1;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: String(idx + 1),
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return res.json({ points, total });
}
//
// 🔹 3) STOKTAN ÇIKAN / STOĞA GİREN
// GET /api/company/dashboard/stock-out?range=&month=
// GET /api/company/dashboard/stock-in?range=&month=
//

// Ortak helper: dönemsel quantity toplama
async function buildStockSeries({ companyId, type, range, monthParam }) {
  if (range === "daily") {
    return await handleDailyStock(companyId, type);
  } else if (range === "weekly") {
    return await handleWeeklyStock(companyId, type);
  } else if (range === "monthly") {
    return await handleMonthlyStock(companyId, type, monthParam);
  } else {
    throw new Error("Geçersiz range değeri");
  }
}

// Stoktan ÇIKAN (OUT)
router.get("/dashboard/stock-out", async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const range = req.query.range || "daily";
    const monthParam = req.query.month;

    if (!companyId) {
      return res.status(400).json({ message: "companyId bulunamadı." });
    }

    const { points, total } = await buildStockSeries({
      companyId,
      type: "OUT",
      range,
      monthParam,
    });

    res.json({ points, total });
  } catch (err) {
    console.error("Stock-out dashboard error:", err);
    res
      .status(500)
      .json({ message: "Stoktan çıkan verileri alınırken bir hata oluştu." });
  }
});

// Stoğa GİREN (IN)
router.get("/dashboard/stock-in", async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const range = req.query.range || "daily";
    const monthParam = req.query.month;

    if (!companyId) {
      return res.status(400).json({ message: "companyId bulunamadı." });
    }

    const { points, total } = await buildStockSeries({
      companyId,
      type: "IN",
      range,
      monthParam,
    });

    res.json({ points, total });
  } catch (err) {
    console.error("Stock-in dashboard error:", err);
    res
      .status(500)
      .json({ message: "Stoğa giren verileri alınırken bir hata oluştu." });
  }
});

// 🔸 Günlük (son 7 gün)
async function handleDailyStock(companyId, type) {
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  const from = startOfDay(dates[0]);
  const to = endOfDay(today);

  const moves = await prisma.stockMovement.findMany({
    where: {
      companyId,
      type,
      createdAt: {
        gte: from,
        lte: to,
      },
      NOT: {
        reason: "CORRECTION", // 👈 düzeltmeleri dışarıda bırak
      },
    },
  });

  const map = {};
  for (const m of moves) {
    const key = m.createdAt.toISOString().slice(0, 10);
    map[key] = (map[key] || 0) + (m.quantity || 0);
  }

  const points = dates.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const value = map[key] || 0;
    const label = d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
    });
    return { label, value };
  });

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return { points, total };
}


// 🔸 Haftalık (son 4 hafta)
async function handleWeeklyStock(companyId, type) {
  const today = new Date();
  const from = startOfDay(new Date(today));
  from.setDate(from.getDate() - 27);

  const moves = await prisma.stockMovement.findMany({
    where: {
      companyId,
      type,
      createdAt: {
        gte: from,
        lte: endOfDay(today),
      },
      NOT: { reason: "CORRECTION" },

    },
  });

  const buckets = [0, 0, 0, 0];

  for (const m of moves) {
    const diffMs = endOfDay(today) - startOfDay(m.createdAt);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weekIndexFromNow = Math.floor(diffDays / 7);
    const bucketIndex = 3 - weekIndexFromNow;

    if (bucketIndex >= 0 && bucketIndex <= 3) {
      buckets[bucketIndex] += m.quantity || 0;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: WEEK_LABELS[idx],
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return { points, total };
}

// 🔸 Aylık (seçili ay)
async function handleMonthlyStock(companyId, type, monthParam) {
  let year, monthIndex;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    monthIndex = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIndex = now.getMonth();
  }

  const start = new Date(year, monthIndex, 1);
  const end = endOfDay(new Date(year, monthIndex + 1, 0));
  const daysInMonth = end.getDate();

  const moves = await prisma.stockMovement.findMany({
    where: {
      companyId,
      type,
      createdAt: {
        gte: start,
        lte: end,
      },
      NOT: { reason: "CORRECTION" },

    },
  });

  const buckets = new Array(daysInMonth).fill(0);

  for (const m of moves) {
    const day = m.createdAt.getDate();
    const index = day - 1;
    if (index >= 0 && index < daysInMonth) {
      buckets[index] += m.quantity || 0;
    }
  }

  const points = buckets.map((value, idx) => ({
    label: String(idx + 1),
    value,
  }));

  const total = points.reduce((sum, p) => sum + p.value, 0);
  return { points, total };
}

module.exports = router;
