
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);
    console.log("Using API Key:", (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY)?.slice(0, 10) + "...");

    try {
        // There isn't a direct listModels on genAI instance in some versions, 
        // but let's try to just run a simple prompt on a few likely models to see which one works.

        const modelsToTry = [
            "gemini-3-flash",
            "gemini-1.5-flash",
            "gemini-pro",
            "gemini-1.0-pro",
            "gemini-2.0-flash",
            "gemini-2.5-flash-lite", // Seen in user code
            "gemini-2.5-flash"
        ];

        for (const modelName of modelsToTry) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} worked! Response: ${result.response.text()}`);
                return; // Found one
            } catch (e) {
                console.log(`Failed ${modelName}: ${e.message}`);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
