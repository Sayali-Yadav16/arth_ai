
import dotenv from "dotenv";
dotenv.config();

import { extractGraphFromText } from "./rag/extractor.js";
import { getGraphContext, clearGraph } from "./rag/graphStore.js";
import { chunkText } from "./rag/chunker.js";


async function testGraphRAG() {
    console.log("Testing Graph RAG...");

    const sampleText = `
  Mr. Sharma had a total income of 12,00,000 INR for the financial year 2024-25.
  He invested 50,000 INR in section 80D for health insurance.
  He also claimed 1,50,000 INR under section 80C.
  The standard deduction is 50,000 INR.
  `;

    console.log("Input Text:", sampleText);

    // 1. Chunk
    const chunks = chunkText(sampleText, 200);
    console.log("Chunks:", chunks.length);

    // 2. Extract
    clearGraph();
    for (const chunk of chunks) {
        console.log("Extracting from chunk using Gemini...");
        const result = await extractGraphFromText(chunk);
        console.log("Extracted entities:", result.entities?.length);
        console.log("Extracted relations:", result.relations?.length);
    }

    // 3. Retrieve
    const context = getGraphContext();
    console.log("Graph Context Preview:");
    console.log(context.substring(0, 500) + "...");

    if (context.length === 0) {
        console.log("WARNING: Empty context retrieved. Graph extraction might have failed or returned empty.");
    }

    console.log("Test Complete.");
}

testGraphRAG().catch(console.error);
