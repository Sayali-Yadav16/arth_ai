const store = [];

export function addVector(embedding, content) {
  store.push({ embedding, content });
}

function cosineSimilarity(a, b) {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

export function searchVectors(queryEmbedding, k = 4) {
  return store
    .map(v => ({
      ...v,
      score: cosineSimilarity(queryEmbedding, v.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
