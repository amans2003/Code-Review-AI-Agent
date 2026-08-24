# AI Code Review Report — Code-Review-AI-Agent

* **Overall Score**: 51/100
* **Security Score**: 40/100
* **Performance Score**: 40/100
* **Clean Code Score**: 40/100
* **Architecture Score**: 83/100
* **Created At**: 8/24/2026, 7:41:55 PM

### Scan Overview
Scanned **41 file(s)** and found **65 issue(s)**.

### Scores
* **Security**: 40/100
* **Performance**: 40/100
* **Clean Code**: 40/100
* **Architecture**: 83/100
* **Overall**: **51/100**

Please inspect the flagged lines in the editor gutter for proposed code fixes.

## Detailed Findings Log (65 Issues)

### 1. [LOW] CLEANCODE issue in `backend/config/db.js` (Line 6)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`MongoDB Connected: ${conn.connection.host}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 2. [LOW] CLEANCODE issue in `backend/config/db.js` (Line 16)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Database: Dropped legacy index "${idxName}".`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 3. [LOW] CLEANCODE issue in `backend/config/passport.js` (Line 56)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log('Passport: GitHub OAuth Strategy initialized.');
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 4. [HIGH] SECURITY issue in `backend/controllers/authController.js` (Line 1)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
const jwt = require('jsonwebtoken');
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 5. [LOW] CLEANCODE issue in `backend/controllers/authController.js` (Line 51)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`[auth/github-url] Attempting login for GitHub user: ${githubUsername}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 6. [LOW] CLEANCODE issue in `backend/controllers/authController.js` (Line 61)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`[auth/github-url] GitHub profile fetched: login=${githubProfile.login}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 7. [LOW] CLEANCODE issue in `backend/controllers/authController.js` (Line 101)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`[auth/github-url] User record ready: id=${user._id}, username=${user.username}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 8. [HIGH] SECURITY issue in `backend/middleware/auth.js` (Line 1)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
const jwt = require('jsonwebtoken');
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 9. [HIGH] SECURITY issue in `backend/middleware/auth.js` (Line 8)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
token = req.headers.authorization.split(' ')[1];
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 10. [HIGH] SECURITY issue in `backend/middleware/auth.js` (Line 14)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 11. [HIGH] SECURITY issue in `backend/middleware/auth.js` (Line 22)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
req.user = await User.findById(decoded.id).select('-password');
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 12. [HIGH] SECURITY issue in `backend/middleware/auth.js` (Line 31)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
res.status(401).json({ success: false, message: 'Not authorized, token failed' });
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 13. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 48)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Connecting to Redis on ${redisHost}:${redisPort}...`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 14. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 59)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log('Redis connection failed. Falling back to local in-memory queue worker.');
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 15. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 68)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log('Successfully connected to Redis. Initializing BullMQ.');
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 16. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 79)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log('Redis offline mode enabled.');
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 17. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 94)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`BullMQ: Job added with ID ${jobId}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 18. [LOW] CLEANCODE issue in `backend/queues/reviewQueue.js` (Line 97)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`InMemoryQueue: Job added with ID ${jobId}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 19. [LOW] CLEANCODE issue in `backend/server.js` (Line 54)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Server executing in production mode on port ${PORT}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 20. [HIGH] SECURITY issue in `backend/services/ai/agentService.js` (Line 10)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
- Unsafe eval() or dangerous execution wrappers
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 21. [MEDIUM] SECURITY issue in `backend/services/ai/agentService.js` (Line 11)
* **Message**: Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).
* **Code Snippet**:
```javascript
- Cross-Site Scripting (XSS) via innerHTML/dangerouslySetInnerHTML
```
* **Recommendation**: Ensure the input content is thoroughly sanitized using a library like dompurify before rendering.

### 22. [LOW] CLEANCODE issue in `backend/services/github/cloneService.js` (Line 99)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Cleaned up temp path: ${clonePath}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 23. [LOW] CLEANCODE issue in `backend/services/streaming/sseManager.js` (Line 41)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`SSE Client registered for job: ${jobId}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 24. [LOW] CLEANCODE issue in `backend/services/streaming/sseManager.js` (Line 53)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`SSE: No client registered for job: ${jobId} (Message: ${status} - ${JSON.stringify(message).substring(0, 60)})`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 25. [LOW] CLEANCODE issue in `backend/services/streaming/sseManager.js` (Line 80)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`SSE Client unregistered for job: ${jobId}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 26. [HIGH] SECURITY issue in `backend/utils/mockAi.js` (Line 46)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
message: 'Potential hardcoded sensitive credential or API token discovered.',
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 27. [HIGH] SECURITY issue in `backend/utils/mockAi.js` (Line 55)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
if (cleanLine.includes('eval(') && !cleanLine.startsWith('//')) {
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 28. [HIGH] SECURITY issue in `backend/utils/mockAi.js` (Line 61)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
message: 'Critical Security Risk: Usage of `eval()` detected.',
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 29. [HIGH] SECURITY issue in `backend/utils/mockAi.js` (Line 63)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
suggestion: 'Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.',
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 30. [MEDIUM] SECURITY issue in `backend/utils/mockAi.js` (Line 70)
* **Message**: Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).
* **Code Snippet**:
```javascript
if (cleanLine.includes('dangerouslySetInnerHTML') && !cleanLine.startsWith('//')) {
```
* **Recommendation**: Ensure the input content is thoroughly sanitized using a library like dompurify before rendering.

### 31. [MEDIUM] SECURITY issue in `backend/utils/mockAi.js` (Line 76)
* **Message**: Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).
* **Code Snippet**:
```javascript
message: 'Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).',
```
* **Recommendation**: Ensure the input content is thoroughly sanitized using a library like dompurify before rendering.

### 32. [MEDIUM] SECURITY issue in `backend/utils/mockAi.js` (Line 79)
* **Message**: Use of dangerouslySetInnerHTML detected. Potential Cross-Site Scripting (XSS).
* **Code Snippet**:
```javascript
proposedFix: `// Import DOMPurify sanitizer library:\nimport DOMPurify from 'dompurify';\n\nreturn <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dirtyHtml) }} />;`
```
* **Recommendation**: Ensure the input content is thoroughly sanitized using a library like dompurify before rendering.

### 33. [HIGH] PERFORMANCE issue in `backend/utils/mockAi.js` (Line 126)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
(cleanLine.includes('useEffect(') || cleanLine.includes('useMemo(') || cleanLine.includes('useCallback(')) &&
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 34. [LOW] CLEANCODE issue in `backend/utils/mockAi.js` (Line 146)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
if (cleanLine.includes('console.log(') && !cleanLine.startsWith('//')) {
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 35. [HIGH] SECURITY issue in `backend/utils/mockAi.js` (Line 246)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
if (securityCount > 0) suggestions.push('Fix hardcoded keys/secrets and dangerous eval() calls.');
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 36. [MEDIUM] CLEANCODE issue in `backend/utils/pdfGenerator.js` (Line 10)
* **Message**: Function is too complex (74 lines long).
* **Code Snippet**:
```javascript
const generateReviewPDF = (review, repo, user, stream) => {
```
* **Recommendation**: Refactor this long function by breaking it down into smaller, single-responsibility helper functions.

### 37. [LOW] CLEANCODE issue in `backend/workers/reviewWorker.js` (Line 22)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Worker: Starting review job ${jobId}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 38. [LOW] CLEANCODE issue in `backend/workers/reviewWorker.js` (Line 73)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Worker: Job ${jobId} finished successfully! Saved Review ID: ${newReview._id}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 39. [LOW] CLEANCODE issue in `backend/workers/reviewWorker.js` (Line 100)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Worker: Processing in-memory job: ${job.id}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 40. [LOW] CLEANCODE issue in `backend/workers/reviewWorker.js` (Line 121)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log('Worker connected to Redis. Starting BullMQ Worker loop.');
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 41. [LOW] CLEANCODE issue in `backend/workers/reviewWorker.js` (Line 123)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
console.log(`Worker: Processing BullMQ job: ${job.id}`);
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 42. [HIGH] PERFORMANCE issue in `frontend/src/components/LiveConsole.jsx` (Line 7)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 43. [HIGH] PERFORMANCE issue in `frontend/src/components/MonacoViewer.jsx` (Line 55)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 44. [HIGH] PERFORMANCE issue in `frontend/src/components/MonacoViewer.jsx` (Line 64)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 45. [HIGH] PERFORMANCE issue in `frontend/src/context/AuthContext.jsx` (Line 11)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 46. [HIGH] SECURITY issue in `frontend/src/context/AuthContext.jsx` (Line 13)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
const token = localStorage.getItem('token');
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 47. [HIGH] PERFORMANCE issue in `frontend/src/pages/Dashboard.jsx` (Line 25)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 48. [HIGH] PERFORMANCE issue in `frontend/src/pages/Dashboard.jsx` (Line 44)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 49. [LOW] ARCHITECTURE issue in `frontend/src/pages/Dashboard.jsx` (Line 236)
* **Message**: Inline styles present in JSX component.
* **Code Snippet**:
```javascript
style={{ backgroundColor: getLanguageColor(repo.language) }}
```
* **Recommendation**: Move inline styles to Tailwind CSS classes or styled-components to maintain CSS separation.

### 50. [HIGH] PERFORMANCE issue in `frontend/src/pages/Login.jsx` (Line 15)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 51. [LOW] CLEANCODE issue in `frontend/src/pages/Playground.jsx` (Line 9)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
js_basic: `// Simple Javascript presets\nconsole.log("Hello, developer! Modify this code and click 'Run Code'.");\n\nconst items = [10, 20, 30];\nconst sum = items.reduce((acc, c) => acc + c, 0);\nconsole.log("Total sum is: " + sum);`,
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 52. [HIGH] SECURITY issue in `frontend/src/pages/Playground.jsx` (Line 11)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
security_vuln: `// Security Vulnerability Example\nconst API_SECRET_TOKEN = "jwt-super-secret-key-12345"; // Hardcoded credential\nconsole.log("Initializing database connection...");\n\nfunction executeTask(userInput) {\n  // Unsafe eval executing raw strings\n  var results = eval(userInput);\n  return results;\n}\n\nconsole.log("Application running.");`,
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 53. [HIGH] SECURITY issue in `frontend/src/pages/Playground.jsx` (Line 11)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
security_vuln: `// Security Vulnerability Example\nconst API_SECRET_TOKEN = "jwt-super-secret-key-12345"; // Hardcoded credential\nconsole.log("Initializing database connection...");\n\nfunction executeTask(userInput) {\n  // Unsafe eval executing raw strings\n  var results = eval(userInput);\n  return results;\n}\n\nconsole.log("Application running.");`,
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 54. [LOW] CLEANCODE issue in `frontend/src/pages/Playground.jsx` (Line 11)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
security_vuln: `// Security Vulnerability Example\nconst API_SECRET_TOKEN = "jwt-super-secret-key-12345"; // Hardcoded credential\nconsole.log("Initializing database connection...");\n\nfunction executeTask(userInput) {\n  // Unsafe eval executing raw strings\n  var results = eval(userInput);\n  return results;\n}\n\nconsole.log("Application running.");`,
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 55. [LOW] CLEANCODE issue in `frontend/src/pages/Playground.jsx` (Line 13)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
performance_bottleneck: `// Performance Loop Bottleneck Example\nconst dataset = Array.from({ length: 100 }, (_, i) => ({ id: i, value: i * 2 }));\n\nfunction verifyValues(items) {\n  console.log("Auditing items...");\n  // Dangerous nested loop: O(N^2) complexity lookup smell\n  items.forEach(a => {\n    items.forEach(b => {\n      if (a.id === b.id && a.value !== b.value) {\n        console.log("Conflict discovered: " + a.id);\n      }\n    });\n  });\n}\n\nverifyValues(dataset);`,
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 56. [LOW] CLEANCODE issue in `frontend/src/pages/Playground.jsx` (Line 15)
* **Message**: Leftover debug logging statement: `console.log` detected.
* **Code Snippet**:
```javascript
react_hook_smell: `// React Hook Smell Example\nimport React, { useEffect, useState } from 'react';\n\nexport const MyWidget = ({ userId }) => {\n  const [data, setData] = useState(null);\n\n  // Missing dependency array: triggers query on EVERY re-render!\n  useEffect(() => {\n    console.log("Fetching user profile...");\n    fetch(\`/api/user/\${userId}\`)\n      .then(res => res.json())\n      .then(d => setData(d));\n  }); \n\n  return <div style={{ color: 'red', padding: '10px' }}>User: {data?.name}</div>;\n}`
```
* **Recommendation**: Remove debug log messages prior to production builds, or use a custom Logger library.

### 57. [LOW] ARCHITECTURE issue in `frontend/src/pages/Playground.jsx` (Line 15)
* **Message**: Inline styles present in JSX component.
* **Code Snippet**:
```javascript
react_hook_smell: `// React Hook Smell Example\nimport React, { useEffect, useState } from 'react';\n\nexport const MyWidget = ({ userId }) => {\n  const [data, setData] = useState(null);\n\n  // Missing dependency array: triggers query on EVERY re-render!\n  useEffect(() => {\n    console.log("Fetching user profile...");\n    fetch(\`/api/user/\${userId}\`)\n      .then(res => res.json())\n      .then(d => setData(d));\n  }); \n\n  return <div style={{ color: 'red', padding: '10px' }}>User: {data?.name}</div>;\n}`
```
* **Recommendation**: Move inline styles to Tailwind CSS classes or styled-components to maintain CSS separation.

### 58. [HIGH] PERFORMANCE issue in `frontend/src/pages/ResultsPage.jsx` (Line 29)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 59. [MEDIUM] PERFORMANCE issue in `frontend/src/pages/ResultsPage.jsx` (Line 39)
* **Message**: Nested loops detected. This can result in O(N^2) time complexity or worse.
* **Code Snippet**:
```javascript
data.files = uniqueFiles.map(filePath => ({
```
* **Recommendation**: Optimize the operations using a Map or Set to aggregate lookup elements, reducing search complexity to O(N).

### 60. [MEDIUM] CLEANCODE issue in `frontend/src/pages/ResultsPage.jsx` (Line 206)
* **Message**: Function is too complex (101 lines long).
* **Code Snippet**:
```javascript
const fileIssuesCount = review.issues.filter(i => {
```
* **Recommendation**: Refactor this long function by breaking it down into smaller, single-responsibility helper functions.

### 61. [HIGH] PERFORMANCE issue in `frontend/src/pages/ReviewPage.jsx` (Line 26)
* **Message**: Missing dependency array in React hook. The hook will re-run on EVERY render.
* **Code Snippet**:
```javascript
useEffect(() => {
```
* **Recommendation**: Add an empty array `[]` if this hook should run once on mount, or specify proper dependency variables.

### 62. [HIGH] SECURITY issue in `frontend/src/pages/ReviewPage.jsx` (Line 229)
* **Message**: Critical Security Risk: Usage of `eval()` detected.
* **Code Snippet**:
```javascript
placeholder={`// Paste your JS, TS, React or Node code here...\n\nfunction processData(val) {\n  var result = eval(val);\n  return result;\n}`}
```
* **Recommendation**: Avoid using `eval()` as it executes arbitrary strings with local privileges, opening dangerous execution vulnerabilities.

### 63. [HIGH] SECURITY issue in `frontend/src/services/api.js` (Line 11)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
const token = localStorage.getItem('token');
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 64. [HIGH] SECURITY issue in `frontend/src/services/api.js` (Line 14)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
...(token ? { Authorization: `Bearer ${token}` } : {}),
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

### 65. [HIGH] SECURITY issue in `frontend/src/services/api.js` (Line 62)
* **Message**: Potential hardcoded sensitive credential or API token discovered.
* **Code Snippet**:
```javascript
getDownloadUrl: (id, format) => `${API_BASE_URL}/reviews/${id}/${format}?token=${localStorage.getItem('token')}`
```
* **Recommendation**: Extract this secret to environment variables (`process.env`) and inject it using dotenv.

