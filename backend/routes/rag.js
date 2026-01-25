import express from "express";
import multer from "multer";
import { generateAnalysis } from "../rag/analyzer.js";
import { chunkText } from "../rag/chunker.js";
import { extractText } from "../rag/loader.js";
import { extractGraphFromText } from "../rag/extractor.js";
import { clearGraph, getGraphContext } from "../rag/graphStore.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze", upload.array("files"), async (req, res) => {
  try {
    // Clear previous graph data for fresh analysis
    clearGraph();

    let combinedText = "";

    for (const file of req.files) {
      combinedText += await extractText(file.path);
    }

    // 1. Chunk text
    const chunks = chunkText(combinedText, 1000); // Larger chunks for better context for graph extraction

    // 2. Extract Graph from chunks
    // Process chunks in sequence to avoid rate limits
    for (const chunk of chunks) {
      await extractGraphFromText(chunk);
      // Brief pause to be nice to the rate limiter
      await new Promise(r => setTimeout(r, 2000));
    }

    // 3. Retrieve Context from Graph
    // In a full implementation, we would take a user query. 
    // Here we want an overall analysis, so we might pull summary nodes or the whole graph structure.
    // For now, let's get a text representation of the graph nodes.
    const graphContext = await getGraphContext();

    // 4. Generate Analysis using Graph Context
    const analysis = await generateAnalysis(graphContext);

    res.json({
      summary: analysis.summary,
      findings: analysis.key_findings,
      recommendations: analysis.recommendations,
      compliance: analysis.compliance_check
    });

  } catch (err) {
    console.error("RAG ERROR DETAILED:", err);
    res.status(500).json({ error: "RAG analysis failed", details: err.message });
  }
});

import { chatWithGraph } from "../rag/chat.js";

router.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Retrieve global graph context (assuming single user session for now)
    const context = await getGraphContext();

    if (!context || context.trim() === "") {
      return res.status(400).json({ error: "No document context found. Please upload a document first." });
    }

    const answer = await chatWithGraph(query, context);
    res.json({ answer });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: "Chat failed", details: err.message });
  }
});

export default router;
