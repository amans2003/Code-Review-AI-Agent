/**
 * High-fidelity Heuristics-based Code Review Engine
 * Simulates a multi-agent review when LLM API keys are not supplied.
 * It scans files for actual syntactic issues.
 */

const analyzeFiles = (files) => {
  const issues = [];
  const suggestions = [];

  let securityCount = 0;
  let performanceCount = 0;
  let cleanCodeCount = 0;
  let architectureCount = 0;

  // Let's scan each file
  files.forEach((file) => {
    const lines = file.content.split('\n');
    let inBigFunction = false;
    let functionLineCount = 0;
    let functionStartLine = 0;

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const cleanLine = lineText.trim();

      // --- 1. SECURITY AGENT HEURISTICS ---
      // Secrets detection
      if (
        (cleanLine.includes('password') || 
         cleanLine.includes('secret') || 
         cleanLine.includes('token') || 
         cleanLine.includes('api_key') || 
         cleanLine.includes('apikey') || 
         cleanLine.includes('jwtSecret')) &&
        (cleanLine.includes('=') || cleanLine.includes(':')) &&
        (cleanLine.includes("'") || cleanLine.includes('"') || cleanLine.includes('`')) &&
        !cleanLine.includes('process.env') && 
        !cleanLine.includes('config')
      ) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'High',
          category: 'security',
          message: 'Potential hardcoded sensitive credential or API token discovered.',
          code: cleanLine,
          suggestion: 'Extract this secret to environment variables (`process.env`) and inject it using dotenv.',
          proposedFix: `// Add this to your local .env configuration file:\n// API_SECRET_KEY=your_key_here\n\nconst apiSecret = process.env.API_SECRET_KEY;`
        });
        securityCount++;
      }

      // Eval usage
      if (cleanLine.includes('eval(') && !cleanLine.startsWith('//')) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'High',
          category: 'security',
          message: 'Critical Security Risk: Usage of `eval()` detected.',
          code: cleanLine,
          suggestion: 'Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.',
          proposedFix: `// Replace eval with safe JSON parsing or sandboxed execution:\nconst parsedData = JSON.parse(input);`
        });
        securityCount++;
      }

      // dangerouslySetInnerHTML
      if (cleanLine.includes('dangerouslySetInnerHTML') && !cleanLine.startsWith('//')) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Medium',
          category: 'security',
          message: 'Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).',
          code: cleanLine,
          suggestion: 'Ensure the input content is thoroughly sanitized using a library like dompurify before rendering.',
          proposedFix: `// Import DOMPurify sanitizer library:\nimport DOMPurify from 'dompurify';\n\nreturn <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dirtyHtml) }} />;`
        });
        securityCount++;
      }

      // Mongo Injection risk
      if (
        (cleanLine.includes('req.query') || cleanLine.includes('req.body') || cleanLine.includes('req.params')) &&
        cleanLine.includes('$') &&
        (cleanLine.includes('find(') || cleanLine.includes('findOne(') || cleanLine.includes('update('))
      ) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Medium',
          category: 'security',
          message: 'Potential NoSQL Query Injection vulnerability.',
          code: cleanLine,
          suggestion: 'Sanitize query parameters or use mongoose schemas to cast values before passing directly to find selectors.',
          proposedFix: `// Cast input parameter to String to prevent parameter query injection:\nconst searchId = String(req.query.id);\nconst record = await User.findOne({ _id: searchId });`
        });
        securityCount++;
      }


      // --- 2. PERFORMANCE AGENT HEURISTICS ---
      // Nested Loops
      if (
        (cleanLine.startsWith('for ') || cleanLine.startsWith('while ') || cleanLine.includes('.map(') || cleanLine.includes('.forEach(')) &&
        idx > 0 &&
        (lines[idx - 1].trim().startsWith('for ') || lines[idx - 1].trim().startsWith('while ') || lines[idx - 1].trim().includes('.map(') || lines[idx - 1].trim().includes('.forEach('))
      ) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Medium',
          category: 'performance',
          message: 'Nested loops detected. This can result in O(N^2) time complexity or worse.',
          code: cleanLine,
          suggestion: 'Optimize the operations using a Map or Set to aggregate lookup elements, reducing search complexity to O(N).',
          proposedFix: `// Index key elements into a Map lookup table instead of nested iterations:\nconst lookupMap = new Map(arrayB.map(item => [item.id, item]));\narrayA.forEach(a => {\n  const match = lookupMap.get(a.targetId);\n});`
        });
        performanceCount++;
      }

      // Missing React dependency array
      if (
        (cleanLine.includes('useEffect(') || cleanLine.includes('useMemo(') || cleanLine.includes('useCallback(')) &&
        !cleanLine.includes('[') && 
        !cleanLine.includes(']')
      ) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'High',
          category: 'performance',
          message: 'Missing dependency array in React hook. The hook will re-run on EVERY render.',
          code: cleanLine,
          suggestion: 'Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.',
          proposedFix: `// Specify external function hooks references in dependency array:\nuseEffect(() => {\n  fetchData();\n}, [fetchData]);`
        });
        performanceCount++;
      }


      // --- 3. CLEAN CODE AGENT HEURISTICS ---
      // Console.logs left in code
      if (cleanLine.includes('console.log(') && !cleanLine.startsWith('//')) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Low',
          category: 'cleanCode',
          message: 'Leftover debug logging statement: `console.log` detected.',
          code: cleanLine,
          suggestion: 'Remove debug log messages prior to production builds, or use a custom Logger library.',
          proposedFix: `// Remove print statement or replace with a dedicated log manager:\n// logger.debug("Process data execution logs");`
        });
        cleanCodeCount++;
      }

      // Var usage
      if (cleanLine.startsWith('var ') && !cleanLine.startsWith('//')) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Low',
          category: 'cleanCode',
          message: 'Legacy declaration `var` used instead of block-scoped `let` or `const`.',
          code: cleanLine,
          suggestion: 'Replace `var` statements with `const` (for constants) or `let` (for reassignable variables) to prevent scope hoisting.',
          proposedFix: `// Declare block-scoped references instead of var:\nconst maxItems = 10;\nlet currentCount = 0;`
        });
        cleanCodeCount++;
      }

      // Function Length Check (Simple estimation)
      if (cleanLine.includes('function ') || cleanLine.includes('const ') && cleanLine.includes('=>')) {
        inBigFunction = true;
        functionLineCount = 0;
        functionStartLine = lineNum;
      }
      if (inBigFunction) {
        functionLineCount++;
        if (cleanLine === '}' || cleanLine === '});') {
          inBigFunction = false;
          if (functionLineCount > 60) {
            issues.push({
              file: file.path,
              line: functionStartLine,
              severity: 'Medium',
              category: 'cleanCode',
              message: `Function is too complex (${functionLineCount} lines long).`,
              code: lines[functionStartLine - 1].trim(),
              suggestion: 'Refactor this long function by breaking it down into smaller, single-responsibility helper functions.'
            });
            cleanCodeCount++;
          }
        }
      }


      // --- 4. ARCHITECTURE AGENT HEURISTICS ---
      // Inline styles in JSX
      if (cleanLine.includes('style={{') && (file.path.endsWith('.jsx') || file.path.endsWith('.tsx'))) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'Low',
          category: 'architecture',
          message: 'Inline styles present in JSX component.',
          code: cleanLine,
          suggestion: 'Move inline styles to Tailwind CSS classes or styled-components to maintain CSS separation.',
          proposedFix: `// Use tailwind utility classes for design constraints instead of inline configurations:\n<div className="flex items-center justify-between p-4 bg-slate-900 border border-borderDark/40" />`
        });
        architectureCount++;
      }

      // Direct DB connection or MongoDB require in routing/view
      if (
        cleanLine.includes("require('mongoose')") && 
        (file.path.includes('route') || file.path.includes('controller')) &&
        cleanLine.includes('connect')
      ) {
        issues.push({
          file: file.path,
          line: lineNum,
          severity: 'High',
          category: 'architecture',
          message: 'Database connection configuration found in API routes or controllers.',
          code: cleanLine,
          suggestion: 'Extract database initialization to a standalone configuration file (e.g. `config/db.js`) to enforce separation of concerns.',
          proposedFix: `// Extract database initialization to config/db.js:\nconst connectDB = require('../config/db');\nconnectDB();`
        });
        architectureCount++;
      }
    });
  });

  // Calculate scores (default to 95 and subtract for each issue found, min 40)
  const securityScore = Math.max(40, 95 - securityCount * 8);
  const performanceScore = Math.max(40, 95 - performanceCount * 7);
  const cleanCodeScore = Math.max(40, 95 - cleanCodeCount * 5);
  const architectureScore = Math.max(40, 95 - architectureCount * 6);
  const overallScore = Math.round((securityScore + performanceScore + cleanCodeScore + architectureScore) / 4);

  // General recommendations
  if (securityCount > 0) suggestions.push('Fix hardcoded keys/secrets and dangerous eval() calls.');
  if (performanceCount > 0) suggestions.push('Avoid nested loops and add React hook dependencies.');
  if (cleanCodeCount > 0) suggestions.push('Clean up console.logs and use let/const instead of var.');
  if (architectureCount > 0) suggestions.push('Keep database queries out of API routing controllers.');

  if (suggestions.length === 0) {
    suggestions.push('Code matches standard guidelines. No recommendations.');
  }

  // Summary markdown
  const summaryMarkdown = `### Scan Overview
Scanned **${files.length} file(s)** and found **${issues.length} issue(s)**.

### Scores
* **Security**: ${securityScore}/100
* **Performance**: ${performanceScore}/100
* **Clean Code**: ${cleanCodeScore}/100
* **Architecture**: ${architectureScore}/100
* **Overall**: **${overallScore}/100**

Please inspect the flagged lines in the editor gutter for proposed code fixes.`;

  return {
    securityScore,
    performanceScore,
    cleanCodeScore,
    architectureScore,
    overallScore,
    issues,
    suggestions,
    summary: summaryMarkdown
  };
};

module.exports = {
  analyzeFiles
};
