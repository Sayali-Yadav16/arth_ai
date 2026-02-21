import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { db } = require('../config/firebase.js');

const NODES_COLLECTION = 'rag_nodes';
const EDGES_COLLECTION = 'rag_edges';

// In a real multi-user app, we would namespace this by userId or sessionId
// For this demo, we will use a global collection but clear it on "analyze"

export async function clearGraph() {
    // Note: Deleting collections in Firestore from client/admin is not atomic/simple "drop".
    // We will query and batch delete.
    const batch = db.batch();

    const nodes = await db.collection(NODES_COLLECTION).get();
    nodes.docs.forEach(doc => batch.delete(doc.ref));

    const edges = await db.collection(EDGES_COLLECTION).get();
    edges.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
}

export async function addNode(node) {
    // Firestore set (upsert)
    // node.id is required
    await db.collection(NODES_COLLECTION).doc(String(node.id)).set(node);
}

export async function addEdge(sourceId, targetId, relation) {
    // Filter out undefined values to prevent Firestore errors
    if (!sourceId || !targetId || !relation) {
        console.warn(`Skipping edge with undefined values: source=${sourceId}, target=${targetId}, relation=${relation}`);
        return;
    }
    const edgeData = {};
    if (sourceId !== undefined) edgeData.source = sourceId;
    if (targetId !== undefined) edgeData.target = targetId;
    if (relation !== undefined) edgeData.relation = relation;
    
    await db.collection(EDGES_COLLECTION).add(edgeData);
}

export async function getGraphContext(queryEmbedding) {
    const nodesSnap = await db.collection(NODES_COLLECTION).get();
    // In a real vector search, we would query Pinecone/Weaviate here.
    // Since we are using Gemini Context caching (simulated by small graph), we assume retrieval of all context for now.

    let context = "Entities:\n";
    nodesSnap.docs.forEach(doc => {
        const n = doc.data();
        context += `- ${n.content} (${n.label})\n`;
    });

    context += "\n\nRelationships:\n";
    const edgesSnap = await db.collection(EDGES_COLLECTION).get();
    // We need a lookup for node content
    const nodeMap = new Map();
    nodesSnap.docs.forEach(doc => nodeMap.set(doc.id, doc.data().content));

    edgesSnap.docs.forEach(doc => {
        const e = doc.data();
        const source = nodeMap.get(e.source) || "Unknown";
        const target = nodeMap.get(e.target) || "Unknown";
        context += `- ${source} ${e.relation} ${target}\n`;
    });

    return context;
}

export async function getWholeGraph() {
    const nodesSnap = await db.collection(NODES_COLLECTION).get();
    const edgesSnap = await db.collection(EDGES_COLLECTION).get();

    return {
        nodes: nodesSnap.docs.map(d => d.data()),
        edges: edgesSnap.docs.map(d => d.data())
    };
}
