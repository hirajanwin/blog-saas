import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useState } from 'react';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: TiptapEditorProps) {
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px]',
        placeholder,
      },
    },
  });

  // Markdown shortcuts
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
  }, [editor]);

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      <EditorContent
        editor={editor}
        className="p-4 focus:outline-none"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}