
import { GoogleGenerativeAI } from "@google/generative-ai";
import { embedText } from "./embedder.js";
import { addEdge, addNode } from "./graphStore.js";

export async function extractGraphFromText(text) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);

    // Fallback order to try if one is rate-limited
    const models = [process.env.GEMINI_MODEL || "gemini-1.5-flash", "gemini-pro"];
    let currentModelIndex = 0;

    const getModel = () => {
        const m = models[currentModelIndex];
        return genAI.getGenerativeModel({ model: m });
    };


    // improved prompt to extract entities and relations relevant to tax
    const prompt = `
  Analyze the following tax document text and extract entities (Income, Deduction, TaxSection, Person, Date, MonetaryValue) and their relationships.
  
  Text: "${text}"
  
  Return ONLY a JSON object with:
  "entities": [ {"id": "unique_id", "label": "Type", "content": "Value"} ],
  "relations": [ {"source": "source_id", "target": "target_id", "relation": "relationship_desc"} ]
  `;

    try {
        const model = getModel();
        const result = await model.generateContent(prompt);
        const jsonStr = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        if (data.entities) {
            for (const entity of data.entities) {
                // Embed entity content for vector search
                const embedding = await embedText(entity.content);
                addNode({ ...entity, embedding });
            }
        }

        if (data.relations) {
            for (const rel of data.relations) {
                addEdge(rel.source, rel.target, rel.relation);
            }
        }

        return data; // success
    } catch (e) {
        if (e.message && e.message.includes("429")) {
            console.warn(`Rate limit hit on ${models[currentModelIndex]}, trying next model...`);
            currentModelIndex = (currentModelIndex + 1) % models.length; // Rotate model
            const nextModel = getModel();

            await new Promise(r => setTimeout(r, 4000)); // Wait before retry

            try {
                const result = await nextModel.generateContent(prompt);
                const jsonStr = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);

                if (data.entities) {
                    for (const entity of data.entities) {
                        const embedding = await embedText(entity.content);
                        addNode({ ...entity, embedding });
                    }
                }
                if (data.relations) {
                    for (const rel of data.relations) {
                        addEdge(rel.source, rel.target, rel.relation);
                    }
                }
                return data;
            } catch (retryErr) {
                console.error("Retry failed:", retryErr.message);
                return { entities: [], relations: [] };
            }
        }

        console.error("Graph extraction failed", e);
        return { entities: [], relations: [] };
    }
}
