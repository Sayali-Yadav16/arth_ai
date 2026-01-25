P
# 🧮 ArthAI – Smart Income Tax Assistant 🇮🇳

ArthAI (also known as **TaxBuddy**) is an AI-powered smart income tax assistant designed to simplify **Indian Income Tax calculation, understanding, and decision-making**.  
The platform focuses on **tax awareness**, **tax regime comparison**, and **AI-based explanations**, rather than just form filling.
---

## 📌 Problem Statement

Filing income tax in India is often confusing and intimidating, especially for:

- First-time taxpayers  
- Students and young professionals  
- Salaried individuals with limited tax knowledge  

Most existing platforms focus only on form submission and ignore **tax understanding and planning**, which leads to wrong regime selection and missed deductions.

---

## 💡 Solution – ArthAI

ArthAI provides:

- Accurate **rule-based income tax calculation**
- **Old vs New Tax Regime comparison**
- **AI-powered explanations** using Gemini AI
- Smart tax-saving insights
- Interactive and user-friendly interface

---

## ✨ Key Features

### 🧮 Income Tax Calculator
- Calculates tax based on:
  - Annual income
  - Age group
  - Basic deductions (80C, 80D)
- Supports both:
  - Old Tax Regime
  - New Tax Regime

---

### 🔄 Old vs New Regime Comparison
- Displays tax payable under both regimes
- Highlights:
  - Better regime
  - Tax savings difference

---

### 🤖 Explain My Tax (AI-Powered)
Uses **Gemini AI** to explain:
- How taxable income was calculated
- Why a particular tax amount is payable
- Which tax regime is better and why
- Basic tax-saving suggestions

---

### 🔐 Authentication
- User login and registration
- JWT-based authentication (backend)
- Secure API communication

---

### 🎙️ Voice Interaction (Optional)
- Voice hover and interactive UI elements
- Improves accessibility and user experience

---

## 🛠️ Tech Stack

### Frontend
- React (Vite) / Next.js
- JavaScript / TypeScript
- Tailwind CSS
- Axios

### Backend (Optional / Separate)
- Node.js
- Express.js
- JWT Authentication

### AI
- Google Gemini API

### Deployment
- Frontend: **Vercel**
- Backend: **Render / Railway**

---

## 📁 Project Structure

```

ArthAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js / next.config.js
│   └── .gitignore
│
├── backend/ (optional)
│   ├── routes/
│   ├── controllers/
│   ├── server.js
│   └── .env
│
└── README.md

```

---

## ⚙️ Environment Variables

### Frontend (Vercel)

```

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=[https://your-backend-url.onrender.com](https://your-backend-url.onrender.com)

```
### Backend (Render / Railway)

```
PORT=4000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

```

⚠️ **Never commit `.env` files to GitHub**

---

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import the repository
4. Set **Root Directory** to `frontend`
5. Add environment variables
6. Click **Deploy**

---

### Backend (Render)

1. Create a new Web Service
2. Connect backend repository
3. Add environment variables
4. Deploy and copy backend URL
5. Update frontend environment variables

---

## ❗ Common Issues & Solutions

### ❌ ERR_CONNECTION_REFUSED
- Cause: Frontend calling `localhost`
- Fix: Use deployed backend URL via environment variables

---

### ❌ Chatbot Not Working on Vercel
- Cause: Missing Gemini API key
- Fix: Add key in Vercel Environment Variables

---

### ❌ Blank Page After Deployment
- Cause: Incorrect Root Directory
- Fix: Set Root Directory = `frontend`

---

## 📈 Future Enhancements

- Multilingual support (Hindi / Marathi)
- Advanced tax deductions (80E, 80G, NPS)
- Voice-based tax queries
- AI-powered tax planning suggestions
- PDF tax report download

---
