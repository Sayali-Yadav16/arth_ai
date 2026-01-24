// ===============================
// SAFE GLOBAL GUARDS
// ===============================
if (!window.ChatbotState) {
  window.ChatbotState = {};
}

const ChatbotState = window.ChatbotState;

if (ChatbotState.initialized) {
  console.warn("Chatbot already initialized");
} else {
  ChatbotState.initialized = true;

  // ===============================
  // CONFIG
  // ===============================
 

  const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  // ===============================
  // STATE
  // ===============================
  ChatbotState.messagesDiv = null;
  ChatbotState.userInput = null;
  ChatbotState.sendBtn = null;
  ChatbotState.chatbotContainer = null;
  ChatbotState.chatbotIcon = null;
  ChatbotState.hasWelcomed = false;

  // ===============================
  // SYSTEM PROMPT
  // ===============================
  const SYSTEM_PROMPT = `
You are TaxBuddy AI, an expert assistant for Indian income tax.

Rules:
- Answer ONLY Indian tax-related questions
- Be clear, simple, and accurate
- Use Indian tax laws, sections, and examples
- Mention Old vs New Regime when relevant
- Do not answer unrelated topics

You specialize in:
- Old vs New Tax Regime
- Section 80C, 80D deductions
- NPS (National Pension Scheme)
- Tax-saving strategies
- ITR filing guidance
`;

  // ===============================
  // WELCOME MESSAGE
  // ===============================
  const WELCOME_MESSAGE = `
Hello! I am your personal Tax Assistant.

I have analyzed your income. Ask me:
• "How is my HRA calculated?"
• "Which tax regime is better?"
• "How to file ITR?"
`;

  // ===============================
  // TOGGLE CHAT
  // ===============================
  function toggleChat() {
    if (!ChatbotState.chatbotContainer) return;

    const isOpening =
      !ChatbotState.chatbotContainer.classList.contains("visible");

    ChatbotState.chatbotContainer.classList.toggle("visible");

    if (isOpening && !ChatbotState.hasWelcomed) {
      addMessage(WELCOME_MESSAGE, "bot");
      ChatbotState.hasWelcomed = true;
    }
  }

  // ===============================
  // INITIALIZE
  // ===============================
  function initializeChatbot() {
    ChatbotState.chatbotIcon = document.getElementById("chatbot-icon");
    ChatbotState.chatbotContainer = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("close-btn");

    ChatbotState.messagesDiv = document.getElementById("chat-messages");
    ChatbotState.userInput = document.getElementById("user-input");
    ChatbotState.sendBtn = document.querySelector("#chat-input button");

    if (!ChatbotState.chatbotIcon || !ChatbotState.chatbotContainer) {
      console.log("Chatbot elements not found on this page - chatbot not available");
      return;
    }

    ChatbotState.chatbotContainer.classList.remove("visible");

    ChatbotState.chatbotIcon.addEventListener("click", toggleChat);
    closeBtn?.addEventListener("click", () => {
      ChatbotState.chatbotContainer.classList.remove("visible");
    });

    ChatbotState.sendBtn?.addEventListener("click", sendMessage);

    ChatbotState.userInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  // ===============================
  // ADD MESSAGE (UI ENHANCED)
  // ===============================
  function addMessage(text, sender) {
    if (!ChatbotState.messagesDiv) return;

    const message = document.createElement("div");
    message.className = `message ${sender}`;

    if (sender === "bot") {
      message.innerHTML = `
        <div class="ai-icon">AI</div>
        <div class="bubble">
          ${text.replace(/\n/g, "<br>")}
        </div>
      `;
    } else {
      message.innerHTML = `
        <div class="bubble">${text}</div>
      `;
    }

    ChatbotState.messagesDiv.appendChild(message);
    ChatbotState.messagesDiv.scrollTop =
      ChatbotState.messagesDiv.scrollHeight;
  }

  // ===============================
  // GEMINI CALL
  // ===============================
  async function askGemini(question) {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              { text: question }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Unable to connect to the tax assistant");
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response."
    );
  }

  // ===============================
  // SEND MESSAGE
  // ===============================
  async function sendMessage() {
    const input = ChatbotState.userInput;
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    addMessage("⏳ Thinking...", "bot");

    try {
      const answer = await askGemini(text);
      ChatbotState.messagesDiv?.lastChild?.remove();
      addMessage(answer, "bot");
    } catch (error) {
      ChatbotState.messagesDiv?.lastChild?.remove();
      addMessage(
        "I'm currently unable to connect to the tax assistant. Please try again shortly.",
        "bot"
      );
    }
  }

  window.sendMessage = sendMessage;

  // ===============================
  // DOM READY
  // ===============================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  } else {
    initializeChatbot();
  }
}
