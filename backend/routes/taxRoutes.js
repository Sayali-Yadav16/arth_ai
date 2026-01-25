import express from 'express';
import { calculateTax, explainTax, getTaxSuggestions, generateTaxSummary } from '../controllers/taxController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post("/calculate", authMiddleware, calculateTax);
router.post("/explain", authMiddleware, explainTax);
router.post("/suggestions", authMiddleware, getTaxSuggestions);
router.post("/summary", authMiddleware, generateTaxSummary);

export default router;
