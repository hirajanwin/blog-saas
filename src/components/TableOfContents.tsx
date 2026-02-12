import { useEffect, useState, useRef } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function generateTableOfContents(content: string): TOCItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');
  
  return Array.from(headings).map((heading, index) => ({
    id: `heading-${index}`,
    text: heading.textContent || '',
    level: parseInt(heading.tagName[1]),
  }));
}

export default function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const items = generateTableOfContents(content);
    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Add IDs to headings in the actual content
    const contentElement = document.querySelector('.article-content');
    if (contentElement) {
      const headings = contentElement.querySelectorAll('h1, h2, h3');
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }

    // Set up intersection observer to track active heading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    if (contentElement) {
      const headings = contentElement.querySelectorAll('h1, h2, h3');
      headings.forEach((heading) => {
        observerRef.current?.observe(heading);
      });
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (tocItems.length < 2) return null;

  return (
    <nav className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {tocItems.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className={`text-left text-sm w-full py-1 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Hook to use in article pages
export function useTableOfContents(contentRef: React.RefObject<HTMLElement>) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll('h1, h2, h3');
    const items: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const id = `toc-heading-${index}`;
      heading.id = id;
      items.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      });
    });

    setTocItems(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [contentRef]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return { tocItems, activeId, scrollToHeading };
}