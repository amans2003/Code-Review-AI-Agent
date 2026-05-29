const PDFDocument = require('pdfkit');

/**
 * Generates a formatted PDF report of the code review
 * @param {object} review - Mongoose Review object
 * @param {object} repo - Mongoose Repository object
 * @param {object} user - User object
 * @param {WritableStream} stream - Target writable stream (res)
 */
const generateReviewPDF = (review, repo, user, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  // Pipe to response stream
  doc.pipe(stream);

  // Styling Helpers
  const primaryColor = '#1f2937'; // Slate-800
  const secondaryColor = '#4f46e5'; // Indigo-600
  const lightBg = '#f9fafb'; // Gray-50
  const borderLight = '#e5e7eb'; // Gray-200

  // 1. HEADER SECTION
  doc
    .rect(0, 0, doc.page.width, 140)
    .fill('#0f172a'); // Dark Slate slate-900

  doc
    .fillColor('#ffffff')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('AI CODE REVIEW REPORT', 50, 40);

  doc
    .fontSize(10)
    .fillColor('#94a3b8')
    .text(`Target Repository: ${repo.repoUrl || 'Manual Code Upload'}`, 50, 75)
    .text(`Project Name: ${repo.repoName}`, 50, 92)
    .text(`Review Date: ${new Date(review.createdAt).toLocaleString()} | Inspected by: ${user.username}`, 50, 109);

  // Reset text color
  doc.fillColor(primaryColor);

  // 2. QUALITY SCORES CARD
  doc.y = 170;
  
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Code Quality Scoreboard', 50, doc.y);

  // Draw table-like container for scores
  const scoreCardTop = doc.y + 15;
  doc
    .rect(50, scoreCardTop, 500, 70)
    .fillAndStroke(lightBg, borderLight);

  // Add individual scores
  doc.fillColor(primaryColor);
  const items = [
    { label: 'Overall', score: review.overallScore },
    { label: 'Security', score: review.securityScore },
    { label: 'Performance', score: review.performanceScore },
    { label: 'Clean Code', score: review.cleanCodeScore },
    { label: 'Architecture', score: review.architectureScore }
  ];

  items.forEach((item, idx) => {
    const xPos = 70 + idx * 95;
    
    // Score Number
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor(item.label === 'Overall' ? secondaryColor : primaryColor)
      .text(`${item.score}`, xPos, scoreCardTop + 15, { width: 80, align: 'center' });

    // Score Label
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(item.label.toUpperCase(), xPos, scoreCardTop + 40, { width: 80, align: 'center' });
  });

  // 3. OVERALL SUMMARY
  doc.y = scoreCardTop + 100;
  doc
    .fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Analysis Executive Summary', 50, doc.y);

  // Print raw summary text (stripping simple markdown markers for PDF readability)
  const cleanSummary = review.summary
    .replace(/[#*`]/g, '') // Strip headings, bold markers, backticks
    .trim();

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#374151')
    .text(cleanSummary, 50, doc.y + 15, { width: 500, align: 'justify', lineGap: 4 });

  // 4. FINDINGS AND ISSUES DETECTED
  doc.addPage();
  
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Detailed Findings Log', 50, 40);

  let currentY = 70;

  if (review.issues && review.issues.length > 0) {
    review.issues.forEach((issue, idx) => {
      // Check if we need to add a new page (roughly 140 points per issue box)
      if (currentY + 140 > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
      }

      // Determine severity color
      let sevColor = '#10b981'; // Green (Low)
      if (issue.severity === 'High') sevColor = '#ef4444'; // Red
      if (issue.severity === 'Medium') sevColor = '#f59e0b'; // Amber

      // Draw issue container
      doc
        .rect(50, currentY, 500, 95)
        .fillAndStroke(lightBg, borderLight);

      // Category / Severity headers
      doc
        .fillColor(sevColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`${issue.severity.toUpperCase()} SEVERITY`, 65, currentY + 12);

      doc
        .fillColor('#6b7280')
        .font('Helvetica')
        .text(`| Category: ${issue.category.toUpperCase()}`, 155, currentY + 12);

      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${issue.file}:${issue.line}`, 65, currentY + 28, { width: 470 });

      // Message
      doc
        .fillColor('#4b5563')
        .font('Helvetica')
        .fontSize(9)
        .text(`Issue: ${issue.message}`, 65, currentY + 44, { width: 470 });

      // Suggestion
      doc
        .fillColor(secondaryColor)
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(`Recommendation: ${issue.suggestion}`, 65, currentY + 65, { width: 470 });

      currentY += 110;
    });
  } else {
    doc
      .fontSize(11)
      .fillColor('#10b981')
      .text('Excellent! No security vulnerabilities, style violations, or bottlenecks were detected in this analysis.', 50, currentY + 15);
  }

  // Footer page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(`Page ${i + 1} of ${pages.count} | Generated by AI Code Review Agent`, 50, doc.page.height - 35, { align: 'center' });
  }

  doc.end();
};

module.exports = {
  generateReviewPDF
};
