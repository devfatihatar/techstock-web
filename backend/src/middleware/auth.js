const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Header'ı alalım (Express hepsini lowercase yapar ama yine de iki türlü deneyelim)
  const rawHeader = req.headers.authorization || req.headers.Authorization;

  console.log("Gelen Authorization header:", rawHeader); // DEBUG İÇİN

  if (!rawHeader) {
    return res.status(401).json({ message: "Yetkisiz erişim (header yok)" });
  }

  // Baştaki/sondaki boşlukları temizleyelim
  const authHeader = rawHeader.trim();

  // "bearer" falan yazsan bile kabul edelim (küçük/büyük harf fark etmesin)
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return res
      .status(401)
      .json({ message: "Yetkisiz erişim (format yanlış, Bearer bekleniyor)" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Yetkisiz erişim (token bulunamadı)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = { id: decoded.companyId, email: decoded.email };
    next();
  } catch (err) {
    console.error("JWT verify hatası:", err.message);
    return res
      .status(401)
      .json({ message: "Geçersiz veya süresi dolmuş token" });
  }
}

module.exports = auth;
