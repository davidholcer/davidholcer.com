"use client";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-expect-error
import tomorrow from "react-syntax-highlighter/dist/styles/tomorrow";
// @ts-expect-error
import solarizedLight from "react-syntax-highlighter/dist/styles/solarized-light";
import { IconCheck, IconCopy, IconPalette } from "@tabler/icons-react";

type CodeBlockProps = {
  language: string;
  filename?: string;
  highlightLines?: number[];
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedTheme, setSelectedTheme] = React.useState('tomorrow');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Detect theme changes
  React.useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = (tabsExist ? tabs[activeTab].code : code) || '';
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;

  // Custom tomorrow theme with pure black background
  const customTomorrowTheme = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      background: '#000000',
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      background: '#000000',
    },
  };

  // Auto-select theme based on mode
  const currentTheme = isDarkMode ? 'tomorrow' : 'solarizedLight';

  return (
    <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm my-6">
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-3 !py-2 text-xs transition-colors font-sans ${
                  activeTab === index
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && (filename || !tabsExist) && (
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-zinc-400">{filename || language}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
          </div>
        )}
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={currentTheme === 'tomorrow' ? customTomorrowTheme : solarizedLight}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: currentTheme === 'tomorrow' ? "#000000" : "#fdf6e3",
          fontSize: "0.875rem", // text-sm equivalent
          textShadow: "none",
          borderRadius: "0.5rem",
          overflow: "auto",
          whiteSpace: "pre",
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        }}
        wrapLines={false}
        showLineNumbers={true}
        lineNumberStyle={{
          color: currentTheme === 'tomorrow' ? "#666" : "#999",
          marginRight: "1rem",
          minWidth: "2rem",
        }}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? currentTheme === 'tomorrow' ? "#303030" : "#eee8d5"
              : "transparent",
            display: "block",
            padding: "0.125rem 0",
            textShadow: "none",
            whiteSpace: "pre",
          },
        })}
        PreTag="div"
        CodeTag="code"
        useInlineStyles={true}
      >
        {activeCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n') || ''}
      </SyntaxHighlighter>
    </div>
  );
};