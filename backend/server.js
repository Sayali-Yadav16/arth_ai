import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import ragRoutes from "./routes/rag.js";
import taxRoutes from "./routes/taxRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/rag", ragRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🚀 TaxBuddy backend running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// ---------------- START SERVER ----------------
// Export for Vercel
export default app;

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}
