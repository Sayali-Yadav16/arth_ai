
import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function checkEmbedding() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);
    console.log("Using API Key:", (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY)?.slice(0, 10));

    const models = ["text-embedding-004", "embedding-001"];

    for (const m of models) {
        console.log(`Testing embedding model: ${m}`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.embedContent("Hello world");
            console.log(`SUCCESS: ${m} worked!`);
            return;
        } catch (e) {
            console.log(`FAILED ${m}: ${e.message}`);
        }
    }
}

checkEmbedding();
