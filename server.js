import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Render poda port w process.env.PORT
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// <-- jeśli potrzebujesz domyślnego API URL, możesz tu zostawić, ale front i tak wysyła ?api=...
// const DEFAULT_API_URL = "...";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ""; // wrzuć w panelu Render jako env

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/discord", async (req, res) => {
  try {
    if (!DISCORD_WEBHOOK_URL) {
      return res.json({ ok: false, msg: "DISCORD_WEBHOOK_URL nie ustawiony" });
    }
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Brak treści" });

    const r = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!r.ok) throw new Error(`Discord HTTP ${r.status}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Błąd Discord:", e);
    res.status(500).json({ error: "Błąd wysyłki do Discord" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const apiUrl = req.query.api;
    if (!apiUrl) {
      return res.status(400).json({ error: "Brak parametru api" });
    }

    const r = await fetch(apiUrl);
    const text = await r.text();
    try {
      const json = JSON.parse(text);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(json);
    } catch (err) {
      console.error("API zwróciło nie-JSON (początek):", text.slice(0, 200));
      res.status(500).json({ error: "API zwróciło nieprawidłowy format (nie JSON)." });
    }
  } catch (e) {
    console.error("Błąd pobierania API:", e);
    res.status(500).json({ error: "Błąd pobierania z API Planera" });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
