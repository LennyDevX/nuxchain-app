/**
 * ✅ TypeScript Migration - Phase 3
 * Markdown Formatter Service
 * Post-processes Gemini responses to ensure consistent markdown formatting
 * WITHOUT emoji injection - let Gemini handle emojis naturally
 */

/**
 * Check if text already has good markdown structure
 */
function hasMarkdownStructure(text: string): boolean {
  if (!text) return false;
  
  const hasHeaders = /^#{1,3}\s+.+$/m.test(text);
  const hasBullets = /^\s*[-*]\s+.+$/m.test(text);
  const hasNumberedLists = /^\s*\d+\.\s+.+$/m.test(text);
  const hasCodeBlocks = /```[\s\S]*?```/.test(text);
  const hasBoldText = /\*\*.+?\*\*/.test(text);
  
  // If it has at least 2 markdown features, consider it formatted
  const features = [hasHeaders, hasBullets, hasNumberedLists, hasCodeBlocks, hasBoldText].filter(Boolean).length;
  return features >= 2;
}

/**
 * Improve markdown formatting of a response
 * SIMPLIFIED: No emoji injection, just ensure spacing and list formatting
 */
function improveMarkdownFormatting(text: string): string {
  if (!text) return text;
  
  // If already has structure, just ensure proper spacing
  if (hasMarkdownStructure(text)) {
    return ensureProperSpacing(text);
  }
  
  // If no structure, try to add basic formatting
  let improved = text;
  
  // Ensure proper paragraph spacing
  improved = ensureProperSpacing(improved);
  
  // Try to add bullet points to lists if they're not formatted
  improved = formatLists(improved);
  
  return improved;
}

/**
 * Ensure proper spacing between paragraphs, lists, and code blocks
 */
function ensureProperSpacing(text: string): string {
  if (!text) return text;
  
  let improved = text;
  
  // Ensure blank line before headers
  improved = improved.replace(/([^\n])\n(#{1,3}\s+)/g, '$1\n\n$2');
  
  // Ensure blank line after headers
  improved = improved.replace(/(#{1,3}\s+.+)\n([^\n#])/g, '$1\n\n$2');
  
  // Ensure blank line before and after code blocks
  improved = improved.replace(/([^\n])\n```/g, '$1\n\n```');
  improved = improved.replace(/```\n([^\n])/g, '```\n\n$1');
  
  // Ensure blank line before lists
  improved = improved.replace(/([^\n])\n([-*]\s+)/g, '$1\n\n$2');
  
  // Clean up excessive blank lines (more than 2)
  improved = improved.replace(/\n{3,}/g, '\n\n');
  
  return improved;
}

/**
 * Format unstructured lists into proper markdown lists
 */
function formatLists(text: string): string {
  if (!text) return text;
  
  // Detect numbered lists without bullets
  // "1. Item" format is already good
  // But "1) Item" or just numbers should be converted
  
  let improved = text.replace(/^(\d+)\)\s/gm, '$1. '); // Convert 1) to 1.
  
  // Detect unformatted lists (sentences that look like list items)
  // This is conservative to avoid false positives
  const lines = improved.split('\n');
  const formattedLines = lines.map((line, idx) => {
    // If line starts with capital letter and is relatively short
    // and previous line ended with a colon or was empty
    // and next line is similar, it might be a list item
    if (idx > 0 && idx < lines.length - 1) {
      const prevLine = lines[idx - 1];
      const nextLine = lines[idx + 1];
      
      if (
        prevLine.trim().endsWith(':') &&
        line.trim().length > 0 &&
        line.trim().length < 100 &&
        !line.match(/^[-*\d]/) &&
        nextLine.trim().length > 0
      ) {
        return `- ${line.trim()}`;
      }
    }
    
    return line;
  });
  
  improved = formattedLines.join('\n');
  
  return improved;
}

/**
 * Post-process Gemini response to ensure markdown quality
 * SIMPLIFIED: Removed emoji injection - let Gemini handle it naturally
 */
export function formatResponseForMarkdown(response: string): string {
  if (!response || typeof response !== 'string') {
    return response;
  }
  
  const formatted = improveMarkdownFormatting(response);
  
  // Debug logging (simplified)
  if (formatted.length !== response.length) {
    console.log('[Markdown Formatter] Applied formatting:', response.length, '→', formatted.length, 'chars');
  }
  
  return formatted;
}

export default {
  formatResponseForMarkdown,
  hasMarkdownStructure,
  improveMarkdownFormatting
};
