import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useState, useEffect } from 'react';
import { analyzeSEO } from '@/lib/seo'
import SEOStatusBar from '@/components/SEOStatusBar'

interface EnhancedTiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSEOChange?: (analysis: ReturnType<typeof analyzeSEO>) => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedTiptapEditor({
  value,
  onChange,
  onSEOChange,
  placeholder = 'Start writing...',
  className = '',
}: EnhancedTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px]',
        placeholder,
      },
    },
  });

  // SEO Analysis
  const [seoAnalysis, setSEOAnalysis] = useState<ReturnType<typeof analyzeSEO> | null>(null);

  // Debounced SEO analysis
  useEffect(() => {
    const content = editor.getHTML();
    if (!content) return;

    // Simple SEO analysis for now
    const title = content.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || '';
    const plainTitle = title.replace(/<[^>]*>/g, '');
    const metaDescription = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)/)?.[1] || '';
    
    const analysis = analyzeSEO(content, plainTitle, metaDescription);
    setSEOAnalysis(analysis);
    onSEOChange?.(analysis);
  }, [editor.getHTML()]);

  // Enhanced markdown shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { metaKey, shiftKey, key } = event;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? metaKey : event.ctrlKey;

    // Bold: Cmd/Ctrl + B
    if (cmdOrCtrl && key === 'b') {
      event.preventDefault();
      editor.chain().focus().toggleBold().run();
      return;
    }

    // Italic: Cmd/Ctrl + I
    if (cmdOrCtrl && key === 'i') {
      event.preventDefault();
      editor.chain().focus().toggleItalic().run();
      return;
    }

    // Headers: Cmd/Ctrl + 1/2/3
    if (cmdOrCtrl && ['1', '2', '3'].includes(key)) {
      event.preventDefault();
      const level = parseInt(key) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    // Link: Cmd/Ctrl + K
    if (cmdOrCtrl && key === 'k') {
      event.preventDefault();
      const url = prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
      return;
    }

    // Bullet list: Cmd/Ctrl + Shift + 8
    if (cmdOrCtrl && shiftKey && key === '8') {
      event.preventDefault();
      editor.chain().focus().toggleBulletList().run();
      return;
    }

    // Ordered list: Cmd/Ctrl + Shift + 9
    if (cmdOrCtrl && shiftKey && key === '9') {
      event.preventDefault();
      editor.chain().focus().toggleOrderedList().run();
      return;
    }

    // Strikethrough: Cmd/Ctrl + Shift + S
    if (cmdOrCtrl && shiftKey && key === 's') {
      event.preventDefault();
      editor.chain().focus().toggleStrike().run();
      return;
    }

    // Code block: Cmd/Ctrl + Shift + C
    if (cmdOrCtrl && shiftKey && key === 'c') {
      event.preventDefault();
      editor.chain().focus().toggleCodeBlock().run();
      return;
    }

    // Blockquote: Cmd/Ctrl + Shift + Q
    if (cmdOrCtrl && shiftKey && key === 'q') {
      event.preventDefault();
      editor.chain().focus().toggleBlockquote().run();
      return;
    }

    // Horizontal rule: Cmd/Ctrl + Shift + H
    if (cmdOrCtrl && shiftKey && key === 'h') {
      event.preventDefault();
      editor.chain().focus().setHorizontalRule().run();
      return;
    }

    // Undo: Cmd/Ctrl + Z
    if (cmdOrCtrl && key === 'z') {
      event.preventDefault();
      editor.chain().focus().undo().run();
      return;
    }

    // Redo: Cmd/Ctrl + Y
    if (cmdOrCtrl && key === 'y') {
      event.preventDefault();
      editor.chain().focus().redo().run();
      return;
    }
  }, [editor]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SEO Status Bar */}
      {seoAnalysis && (
        <SEOStatusBar 
          score={seoAnalysis.score}
          wordCount={seoAnalysis.wordCount}
          readingTime={seoAnalysis.readingTime}
          issues={seoAnalysis.issues}
          suggestions={seoAnalysis.suggestions}
        />
      )}

      {/* Editor */}
      <div className="border border-gray-300 rounded-md">
        <EditorContent
          editor={editor}
          className="p-4 focus:outline-none"
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">B</kbd> Bold</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">I</kbd> Italic</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">1/2/3</kbd> Heading</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">K</kbd> Link</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Shift + 8</kbd> Bullet List</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Shift + 9</kbd> Numbered List</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Shift + S</kbd> Strikethrough</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Shift + Q</kbd> Blockquote</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Shift + C</kbd> Code Block</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Z</kbd> Undo</div>
          <div><kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Cmd/Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Y</kbd> Redo</div>
        </div>
      </div>
    </div>
  );
}