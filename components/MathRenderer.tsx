import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  // Function to render text with basic markdown (bold, italic, newlines)
  const renderMarkdown = (text: string) => {
    // 1. Handle Newlines
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // 2. Handle Bold (**text**)
      const boldParts = line.split(/(\*\*.*?\*\*)/g);
      
      const renderedLine = boldParts.map((part, boldIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={boldIdx} className="font-black text-teal-700 dark:text-teal-400">{part.slice(2, -2)}</strong>;
        }
        
        // 3. Handle Italic (*text*)
        const italicParts = part.split(/(\*.*?\*)/g);
        return italicParts.map((subPart, italicIdx) => {
          if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
             // Check if it looks like a bullet point at start of line
             if(italicIdx === 0 && subPart.trim() === '*') return subPart;
             return <em key={italicIdx} className="text-slate-600 dark:text-slate-300">{subPart.slice(1, -1)}</em>;
          }
          // Handle Bullet points manually for simple lists
          if (subPart.trim().startsWith('* ')) {
             return <span key={italicIdx} className="block pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-teal-500">{subPart.replace('* ', '')}</span>
          }
          return subPart;
        });
      });

      return <React.Fragment key={lineIdx}>{renderedLine}{lineIdx < lines.length - 1 && <br />}</React.Fragment>;
    });
  };

  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Split by Block Math: $$...$$
    // Regex matches $$...$$
    const blockParts = content.split(/(\$\$[\s\S]*?\$\$)/g);

    return blockParts.map((blockPart, blockIdx) => {
      if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
        // Render Block Math
        const math = blockPart.slice(2, -2);
        try {
          const __html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return <div key={blockIdx} dangerouslySetInnerHTML={{ __html }} className="my-2" />;
        } catch (e) {
          return <code key={blockIdx} className="text-red-500">{blockPart}</code>;
        }
      } else {
        // Split by Inline Math: $...$
        // Regex lookbehind/ahead or simple split. Be careful with normal $. 
        // We assume $ is used for math in this context as per prompt instructions.
        const inlineParts = blockPart.split(/(\$[\s\S]*?\$)/g);
        
        return (
          <span key={blockIdx}>
            {inlineParts.map((inlinePart, inlineIdx) => {
              if (inlinePart.startsWith('$') && inlinePart.endsWith('$') && inlinePart.length > 2) {
                // Render Inline Math
                const math = inlinePart.slice(1, -1);
                try {
                  const __html = katex.renderToString(math, { displayMode: false, throwOnError: false });
                  return <span key={inlineIdx} dangerouslySetInnerHTML={{ __html }} />;
                } catch (e) {
                   return <code key={inlineIdx} className="text-red-500">{inlinePart}</code>;
                }
              } else {
                // Render Markdown Text
                return <span key={inlineIdx}>{renderMarkdown(inlinePart)}</span>;
              }
            })}
          </span>
        );
      }
    });
  }, [content]);

  return <div className={`math-content ${className}`}>{renderedContent}</div>;
};

export default MathRenderer;