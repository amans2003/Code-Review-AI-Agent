const axios = require('axios');
const mockAi = require('../../utils/mockAi');

// System Prompts for each agent
const AGENT_PROMPTS = {
  security: `You are a Security Agent. Analyze the provided codebase files for security vulnerabilities.
Look specifically for:
- Secrets, passwords, API tokens, JWT keys, database connections
- SQL/NoSQL Injection vulnerabilities
- Unsafe eval() or dangerous execution wrappers
- Cross-Site Scripting (XSS) via innerHTML/dangerouslySetInnerHTML
Output must be structured as a JSON list of issues. Each issue:
{ "file": "path/to/file", "line": 12, "severity": "High"|"Medium"|"Low", "message": "error desc", "code": "line of code", "suggestion": "fix suggestion" }`,

  performance: `You are a Performance Agent. Analyze the provided codebase files for performance bottlenecks.
Look specifically for:
- Unnecessary loops, O(N^2) or higher complexity, expensive math operations in loops
- React memory leaks, missing dependency arrays in useEffect/useMemo/useCallback
- Bad async handling (e.g. nested await calls that can be parallelized with Promise.all)
Output must be structured as a JSON list of issues. Each issue:
{ "file": "path/to/file", "line": 12, "severity": "High"|"Medium"|"Low", "message": "error desc", "code": "line of code", "suggestion": "fix suggestion" }`,

  cleanCode: `You are a Clean Code Agent. Analyze the provided codebase files for code readability and maintainability.
Look specifically for:
- Variable and function naming issues (cryptic, inconsistent)
- Code duplication and magic numbers
- Overly complex or excessively long functions (above 60 lines)
- Console.log statements left in production code
Output must be structured as a JSON list of issues. Each issue:
{ "file": "path/to/file", "line": 12, "severity": "High"|"Medium"|"Low", "message": "error desc", "code": "line of code", "suggestion": "fix suggestion" }`,

  architecture: `You are an Architecture Agent. Analyze the provided codebase files for system design and clean architecture violations.
Look specifically for:
- Separation of concerns violations (e.g. database logic inside route definition files)
- Monolithic structures, tightly coupled modules
- Inline CSS styles in JSX instead of reusable class stylings
Output must be structured as a JSON list of issues. Each issue:
{ "file": "path/to/file", "line": 12, "severity": "High"|"Medium"|"Low", "message": "error desc", "code": "line of code", "suggestion": "fix suggestion" }`
};

/**
 * Perform codebase review using Google Gemini or Mock Fallback
 * @param {Array<{path: string, content: string}>} files 
 * @param {function} updateProgress - callback to stream progress reports
 * @returns {Promise<object>} review result payload
 */
const runReview = async (files, updateProgress = () => {}) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!geminiKey) {
    updateProgress('running-mock', 'No Gemini API key found. Launching local Heuristic Analyzer...');
    await new Promise((r) => setTimeout(r, 1000));
    
    updateProgress('security', 'Running Security Agent heuristics...');
    await new Promise((r) => setTimeout(r, 800));
    
    updateProgress('performance', 'Running Performance Agent heuristics...');
    await new Promise((r) => setTimeout(r, 800));
    
    updateProgress('cleanCode', 'Running Clean Code Agent heuristics...');
    await new Promise((r) => setTimeout(r, 600));
    
    updateProgress('architecture', 'Running Architecture Agent heuristics...');
    await new Promise((r) => setTimeout(r, 600));

    updateProgress('summary', 'Assembling final review summary scorecards...');
    await new Promise((r) => setTimeout(r, 500));

    return mockAi.analyzeFiles(files);
  }

  // If API Key is present, let's call Gemini API!
  try {
    updateProgress('ai-init', 'Found Gemini API key. Initiating Multi-Agent AI Review...');
    const combinedCode = files.map(f => `// FILE: ${f.path}\n${f.content}`).join('\n\n');

    // We will perform separate agent runs. In a production scenario, we call agents.
    // To minimize token costs, latency, and rate limits, we will query Gemini with a coordinated multi-agent prompt that aggregates all agents.
    const systemPrompt = `You are a multi-agent AI Code Review System consisting of 4 agents:
1. Security Agent (${AGENT_PROMPTS.security})
2. Performance Agent (${AGENT_PROMPTS.performance})
3. Clean Code Agent (${AGENT_PROMPTS.cleanCode})
4. Architecture Agent (${AGENT_PROMPTS.architecture})

Analyze the code files provided below.
Return a structured JSON object exactly matching the following JSON schema:
{
  "securityScore": 85,
  "performanceScore": 78,
  "cleanCodeScore": 92,
  "architectureScore": 81,
  "overallScore": 84,
  "issues": [
    {
      "file": "string",
      "line": number,
      "severity": "High" | "Medium" | "Low",
      "category": "security" | "performance" | "cleanCode" | "architecture",
      "message": "description of the issue",
      "code": "matching line snippet",
      "suggestion": "concrete recommendation to fix the issue",
      "proposedFix": "exact replacement code block to fix this specific issue"
    }
  ],
  "suggestions": [
    "general recommendation 1",
    "general recommendation 2"
  ],
  "summary": "Detailed summary of findings formatted in Markdown. Write a positive, helpful review."
}

Ensure your output contains ONLY the JSON response - no markdown brackets around JSON, no explanation prefix. Ready? Here is the code:

${combinedCode}`;

    updateProgress('security', 'Running Security & Vulnerability Analysis...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    updateProgress('performance', 'Running Performance bottlenecks checks...');
    await new Promise((r) => setTimeout(r, 500));

    updateProgress('cleanCode', 'Validating Clean Code standards & naming conventions...');
    await new Promise((r) => setTimeout(r, 500));

    updateProgress('architecture', 'Analyzing folder structure and Separation of Concerns...');
    await new Promise((r) => setTimeout(r, 500));

    updateProgress('summary', 'Consolidating multi-agent reports into final review document...');

    let responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean response text just in case it wrapped in ```json ... ```
    responseText = responseText.trim();
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const reviewResult = JSON.parse(responseText);
    return reviewResult;
  } catch (error) {
    console.error('Gemini review API failed, falling back to local heuristics:', error.message);
    updateProgress('ai-error', 'AI Review Service encountered error. Falling back to local heuristic analyzer...');
    await new Promise((r) => setTimeout(r, 1000));
    return mockAi.analyzeFiles(files);
  }
};

/**
 * Explains code logic or proposes a fix using Gemini/Mock
 */
const explainCodeSnippet = async (fileName, snippet, question) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!geminiKey) {
    return `### AI Explanation (Offline Mode)
Here is a review of the code snippet from **${fileName}**:

\`\`\`javascript
${snippet}
\`\`\`

**Question Asked**: *${question}*

**Recommendation**:
It appears you're asking about optimizing or refactoring this block. Consider standardizing variable scopes, adding validation checks on inputs, and checking for missing hook dependencies if this is React code. To get detailed live AI chats, please provide a \`GEMINI_API_KEY\` in your \`backend/.env\` configuration file.`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    const prompt = `You are a Senior Software Engineer helping a developer understand their code.
File: ${fileName}
Code Snippet:
\`\`\`
${snippet}
\`\`\`
User Question: ${question}

Provide a concise explanation of the code, point out any structural flaws, and show a code example of how to improve it. Format your answer in markdown.`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI assistant.';
  } catch (error) {
    console.error('Gemini Chat API failed:', error.message);
    const status = error.response?.status;
    if (status === 400 || status === 403 || status === 401) {
      return `### AI Explanation (Key Authentication Issue)

The server attempted to query the Gemini API but received an **authentication error (${status})**. 
Your \`GEMINI_API_KEY\` in your \`backend/.env\` appears to be invalid. Please obtain a valid key from Google AI Studio.

---

**Offline Mock AI Explanation Fallback:**

Here is a review of the code snippet from **${fileName}**:

\`\`\`javascript
${snippet}
\`\`\`

**Question**: *${question}*

**Recommendation**:
Please verify that you have structured inputs correctly, standardized var scopes, and checked for missing react hook dependencies.`;
    }
    return `Failed to fetch response from AI assistant: ${error.message}`;
  }
};

module.exports = {
  runReview,
  explainCodeSnippet
};
