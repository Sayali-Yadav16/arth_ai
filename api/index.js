import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "../backend/routes/authRoutes.js";
import chatbotRoutes from "../backend/routes/chatbotRoutes.js";
import ragRoutes from "../backend/routes/rag.js";
import taxRoutes from "../backend/routes/taxRoutes.js";
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Note: We mount them at /api/... matches the Vercel rewrite source
app.use("/api/auth", authRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/rag", ragRoutes);

// Base API route
app.get("/api", (req, res) => {
    res.json({ message: "🚀 TaxBuddy backend running on Vercel" });
});

// Health check that doesn't start with /api (might be unreachable due to rewrite, but good for local)
app.get("/", (req, res) => {
    res.json({ message: "Use /api endpoints" });
});

// Error handling
app.use((err, req, res, next) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    });
});

export default app;

// Local development support
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    // Check if run directly via node
    // In ESM checking if file is main is tricky, but we can check if not importing
    // However, simple app.listen guarded by !production usually works fine or we can leave it.

    // Actually, simpler way for "npm start":
    // We can create a separate "local-server.js" OR just rely on this check:
    // Vercel doesn't run this file with `node api/index.js`, it imports it.
    // So if we run `node api/index.js`, we want it to listen.

    // Basic check:
    const currentFilePath = fileURLToPath(import.meta.url);
    // Compare normalization
    // process.argv[1] might be undefined in some environments, handle safely
    if (process.argv[1]) {
        const nodeEntry = path.resolve(process.argv[1]);
        const currentPath = path.resolve(currentFilePath);

        if (nodeEntry === currentPath) {
            app.listen(PORT, () => {
                console.log(`✅ Local Server running on http://localhost:${PORT}`);
            });
        }
    }
}
