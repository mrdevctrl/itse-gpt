import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { toast } = useToast();
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set(prev).add(blockIndex));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
      
      toast({
        description: "Code copied to clipboard",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy code",
      });
    }
  };

  // Simple markdown parsing for common elements
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let codeBlockIndex = 0;
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = '';
        } else {
          inCodeBlock = false;
          const blockIndex = codeBlockIndex++;
          elements.push(
            <div key={`code-${i}`} className="relative group my-3">
              <div className="bg-muted rounded-md p-3 font-mono text-sm overflow-x-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeContent, blockIndex)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  data-testid={`button-copy-code-${blockIndex}`}
                >
                  {copiedBlocks.has(blockIndex) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="text-foreground">
                  <code>{codeContent}</code>
                </pre>
              </div>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? '\n' : '') + line;
        continue;
      }

      // Headers
      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-md font-semibold mt-4 mb-2 text-foreground">
            {line.slice(5)}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold mt-4 mb-2 text-foreground">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold mt-4 mb-2 text-foreground">
            {line.slice(2)}
          </h1>
        );
      }
      // Lists
      else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <div key={i} className="ml-4 text-foreground">
            {line}
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={i} className="ml-4 text-foreground">
            • {line.slice(2)}
          </div>
        );
      }
      // Regular paragraphs
      else if (line.trim()) {
        // Handle inline formatting
        let processedLine = line;
        
        // Bold text
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Inline code
        processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>');

        elements.push(
          <p 
            key={i} 
            className="mb-2 text-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
      // Empty lines
      else {
        elements.push(<div key={i} className="h-2" />);
      }
    }

    return elements;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="markdown-content">
      {parseMarkdown(content)}
    </div>
  );
}
