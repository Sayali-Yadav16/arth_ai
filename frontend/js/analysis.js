const API_BASE = "http://localhost:4000/api";
const token = localStorage.getItem("tb_token");

if (!token) window.location.href = "login.html";

let uploadedFiles = [];

// DOM
const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("analysisResult");
const resultContent = document.getElementById("resultContent");
const messages = document.getElementById("messages");

// ---------------- AUTH ----------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ---------------- FILE HANDLING ----------------
uploadZone.onclick = () => fileInput.click();

uploadZone.addEventListener("dragover", e => {
  e.preventDefault();
  uploadZone.style.opacity = 0.7;
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.style.opacity = 1;
});

uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadZone.style.opacity = 1;
  handleFiles(e.dataTransfer.files);
});

fileInput.onchange = e => handleFiles(e.target.files);

function handleFiles(files) {
  uploadedFiles = Array.from(files);
  renderFiles();
  analyzeBtn.style.display = uploadedFiles.length ? "block" : "none";
}

function renderFiles() {
  fileList.innerHTML = "";
  uploadedFiles.forEach((f, i) => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.innerHTML = `
      <span>📄 ${f.name}</span>
      <span style="cursor:pointer;color:#ef4444" onclick="removeFile(${i})">Remove</span>
    `;
    fileList.appendChild(div);
  });
}

function removeFile(i) {
  uploadedFiles.splice(i, 1);
  renderFiles();
  analyzeBtn.style.display = uploadedFiles.length ? "block" : "none";
}

// ---------------- ANALYZE ----------------
analyzeBtn.onclick = async () => {
  if (!uploadedFiles.length) return;

  analyzeBtn.disabled = true;
  analyzeBtn.innerText = "⏳ Analyzing...";

  try {
    const formData = new FormData();
    uploadedFiles.forEach(f => formData.append("files", f));

    const res = await fetch(`${API_BASE}/rag/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");

    renderAnalysis(data);
    showMessage("✓ Analysis completed successfully", "success");
    enableChat();
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "🤖 Analyze Documents";
  }
};

// ---------------- RENDER RESULT ----------------
function renderAnalysis(data) {
  resultContent.innerHTML = `
    <div class="insight-item">
      <h4>📊 Summary</h4>
      <p>${data.summary}</p>
    </div>

    <div class="insight-item">
      <h4>✓ Key Findings</h4>
      <ul style="padding-left: 20px;">
        ${data.findings.map(f => `<li>${f}</li>`).join("")}
      </ul>
    </div>

    <div class="insight-item">
      <h4>💡 Recommendations</h4>
      <ul style="padding-left: 20px;">
        ${data.recommendations.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>

    <div class="insight-item">
      <h4>⚠️ Compliance Check</h4>
      <p>${data.compliance}</p>
    </div>
  `;
  resultBox.style.display = "block";
  // resultBox.scrollIntoView({ behavior: "smooth" }); // removed to let user see chat prompt
}

// ---------------- MESSAGES ----------------
function showMessage(msg, type) {
  messages.innerHTML = `<div class="${type}">${msg}</div>`;
  setTimeout(() => messages.innerHTML = "", 4000);
}

// ---------------- CHAT ----------------
const chatSection = document.getElementById("chatSection");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatHistory = document.getElementById("chatHistory");

function enableChat() {
  chatSection.style.display = "block";
  chatInput.disabled = false;
  sendChatBtn.disabled = false;
  // Scroll to Chat section
  chatSection.scrollIntoView({ behavior: "smooth" });
}

function appendChatBubble(text, isUser) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${isUser ? 'user' : 'ai'}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text; // Safe for text content
  msgDiv.appendChild(bubble);
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendChat() {
  const query = chatInput.value.trim();
  if (!query) return;

  appendChatBubble(query, true);
  chatInput.value = "";
  chatInput.disabled = true;

  try {
    // Show typing indicator
    const typingId = "typing-" + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.id = typingId;
    typingDiv.className = "chat-msg ai";
    typingDiv.innerHTML = `<div class="bubble">...</div>`;
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const res = await fetch(`${API_BASE}/rag/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();

    // Remove typing
    document.getElementById(typingId)?.remove();

    if (!res.ok) throw new Error(data.error || "Failed to get answer");

    appendChatBubble(data.answer, false);
  } catch (err) {
    appendChatBubble("Sorry, I encountered an error: " + err.message, false);
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
}

sendChatBtn.onclick = sendChat;
chatInput.onkeypress = (e) => {
  if (e.key === "Enter") sendChat();
};


