import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { reviewRouter } from "./routes/review.js";
import { githubRouter } from "./routes/github.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

// Multer: store uploaded files in memory as Buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "text/plain"];
    const isCode = file.originalname.match(/\.(js|ts|jsx|tsx|py|java|go|rs|cpp|c|cs|rb|php|swift|kt|md)$/i);
    if (allowed.includes(file.mimetype) || isCode) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

// Routes
app.use("/api/review", upload.single("file"), reviewRouter);
app.use("/api/github", githubRouter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", model: "llama-4-scout-17b (groq)" }));

app.listen(PORT, () => {
  console.log(`\n🚀 Code Reviewer backend running on http://localhost:${PORT}`);
  console.log(`   Groq key: ${process.env.GROQ_API_KEY ? "✓ set" : "✗ missing — set GROQ_API_KEY in .env"}`);
  console.log(`   GitHub token: ${process.env.GITHUB_TOKEN ? "✓ set" : "✗ missing — set GITHUB_TOKEN in .env"}\n`);
});