const { generateText } = require('../utils/gemini');

const analyzeDocuments = async (req, res) => {
  try {
    const { fileContents } = req.body;

    if (!fileContents || !Array.isArray(fileContents) || fileContents.length === 0) {
      return res.status(400).json({ error: 'No documents provided for analysis' });
    }

    console.log(`Analyzing ${fileContents.length} document(s) with Gemini AI`);

    // Combine all file contents into a single prompt
    let combinedContent = '';
    fileContents.forEach((file, index) => {
      combinedContent += `--- Document ${index + 1}: ${file.name} ---\n`;
      combinedContent += `Content:\n${file.content.substring(0, 5000)}`; // Limit content length
      combinedContent += '\n\n';
    });

    // Create comprehensive tax analysis prompt
    const prompt = `
    You are a tax analysis expert. Analyze the following tax documents and provide a detailed analysis.

    DOCUMENTS TO ANALYZE:
    ${combinedContent}

    Please provide a comprehensive tax analysis with the following sections:

    1. DOCUMENT SUMMARY:
    - Briefly summarize what documents were provided
    - Identify the types of tax documents (Form 16, investment proofs, etc.)
    - Note any obvious issues or patterns

    2. KEY FINDINGS:
    - Extract key financial information
    - Identify potential deductions and exemptions
    - Note any discrepancies or inconsistencies
    - Highlight important dates and amounts

    3. TAX OPTIMIZATION RECOMMENDATIONS:
    - Suggest tax-saving strategies based on the documents
    - Recommend specific sections to claim (80C, 80D, etc.)
    - Advise on investment opportunities
    - Suggest documentation improvements

    4. COMPLIANCE CHECK:
    - Verify compliance with tax regulations
    - Identify any missing required documents
    - Note deadlines and filing requirements
    - Flag any potential compliance issues

    5. MISSING DOCUMENTS:
    - List any documents that appear to be missing
    - Suggest additional documents that would help with tax filing

    6. RISK ASSESSMENT:
    - Identify any risks in the current tax situation
    - Note potential audit triggers
    - Suggest risk mitigation strategies

    7. ACTION ITEMS:
    - Provide a clear list of actions to take
    - Prioritize by importance and deadline
    - Include step-by-step guidance

    Format your response clearly with section headings in ALL CAPS.
    Be specific and actionable in your recommendations.
    Use bullet points where appropriate for readability.
    `;

    // Call Gemini API
    const analysis = await generateText(prompt);

    // Return the analysis
    res.json({
      success: true,
      message: 'Documents analyzed successfully',
      analysis: analysis,
      documentsAnalyzed: fileContents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze documents',
      details: error.message,
      apiConfigured: !!process.env.GEMINI_API_KEY,
      suggestion: 'Check Gemini API configuration or try again later'
    });
  }
};

// Export the function properly
module.exports = {
  analyzeDocuments
};