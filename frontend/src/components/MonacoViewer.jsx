import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, AlertCircle, Sparkles } from 'lucide-react';

const MonacoViewer = ({ fileContent = '', fileName = '', issues = [], selectedLine = null }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [decorationsCollection, setDecorationsCollection] = useState([]);

  // Detect language from file name
  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.editorInstance = editor; // Keep reference
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Apply styling options to Monaco Editor
    editor.updateOptions({
      readOnly: true,
      minimap: { enabled: true },
      fontSize: 13,
      lineHeight: 20,
      fontFamily: "'Fira Code', Consolas, monospace",
      renderLineHighlight: 'all',
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      },
      glyphMargin: true
    });

    applyDecorations();
  };

  // Scroll to selected line when it changes
  useEffect(() => {
    if (editorRef.current && selectedLine) {
      editorRef.current.revealLineInCenter(selectedLine);
      editorRef.current.setPosition({ lineNumber: selectedLine, column: 1 });
      editorRef.current.focus();
    }
  }, [selectedLine]);

  // Apply decorations whenever issues or file content changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      applyDecorations();
    }
  }, [issues, fileContent]);

  const applyDecorations = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Filter issues matching this specific file
    const fileIssues = issues.filter(issue => {
      // Handle potential absolute/relative path mismatches
      const issueFile = issue.file.replace(/\\/g, '/');
      const currentFile = fileName.replace(/\\/g, '/');
      return currentFile.endsWith(issueFile) || issueFile.endsWith(currentFile);
    });

    const newDecorations = fileIssues.map(issue => {
      let className = 'bg-yellow-500/10 border-l-2 border-yellow-500';
      let glyphHoverMessage = `[${issue.severity.toUpperCase()}] ${issue.message}`;
      
      if (issue.severity === 'High') {
        className = 'bg-red-500/10 border-l-2 border-red-500';
      } else if (issue.severity === 'Low') {
        className = 'bg-indigo-500/10 border-l-2 border-indigo-500';
      }

      return {
        range: new monaco.Range(issue.line, 1, issue.line, 1),
        options: {
          isWholeLine: true,
          className: className,
          glyphMarginClassName: issue.severity === 'High' ? 'text-red-500' : 'text-yellow-500',
          glyphMarginHoverMessage: { value: glyphHoverMessage },
          // Display code suggestion inline or gutter badge
          marginClassName: 'text-indigo-400'
        }
      };
    });

    // Monaco v8+ method to set decorations
    if (editor.createDecorationsCollection) {
      // Clear old decorations and set new ones
      if (editor.decorationsCollection) {
        editor.decorationsCollection.set(newDecorations);
      } else {
        editor.decorationsCollection = editor.createDecorationsCollection(newDecorations);
      }
    } else {
      // Fallback for older Monaco versions
      const oldDecorations = decorationsCollection || [];
      const applied = editor.deltaDecorations(oldDecorations, newDecorations);
      setDecorationsCollection(applied);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-borderDark/40">
      {/* Editor Header Bar */}
      <div className="bg-[#181818] border-b border-[#282828] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <FileCode className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-mono text-slate-300 font-semibold tracking-wider">
            {fileName || 'select_a_file_to_inspect.js'}
          </span>
        </div>
        
        {issues.length > 0 && (
          <div className="flex items-center space-x-1 text-[10px] text-yellow-500 font-semibold bg-yellow-500/10 px-2.5 py-0.5 rounded border border-yellow-500/20">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>{issues.length} review annotations active</span>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-[400px] relative">
        {fileContent ? (
          <Editor
            height="100%"
            language={getLanguage(fileName)}
            theme="vs-dark"
            value={fileContent}
            onMount={handleEditorDidMount}
            options={{
              automaticLayout: true
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151515] text-slate-500 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-borderDark">
              <FileCode className="h-6 w-6 text-slate-700 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No File Selected</p>
            <p className="text-xs text-slate-600">Select a source file in the left sidebar directory tree to inspect line-by-line review marks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoViewer;
