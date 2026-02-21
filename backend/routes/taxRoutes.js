const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.post("/calculate", authMiddleware, taxController.calculateTax);
router.post("/explain", authMiddleware, taxController.explainTax);
router.post("/suggestions", authMiddleware, taxController.getTaxSuggestions);
router.post("/summary", authMiddleware, taxController.generateTaxSummary);
// analysis endpoint – multer handles the file upload
router.post(
  "/analyze",
  authMiddleware,
  upload.single("document"),   // field name must match frontend
  taxController.analyzeTax
);

module.exports = router;

