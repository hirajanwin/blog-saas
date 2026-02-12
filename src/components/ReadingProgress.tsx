import { useState, useEffect } from 'react';

interface ReadingProgressProps {
  targetRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export default function ReadingProgress({ targetRef, className = '' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const target = targetRef?.current || document.body;
    
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = target.scrollHeight - windowHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      if (documentHeight > 0) {
        const scrollPercent = (scrollTop / documentHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrollPercent)));
      }
    };

    const calculateReadingTime = () => {
      const text = target.innerText || '';
      const wordCount = text.trim().split(/\s+/).length;
      const wordsPerMinute = 200;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(minutes);
    };

    calculateProgress();
    calculateReadingTime();

    window.addEventListener('scroll', calculateProgress);
    window.addEventListener('resize', calculateProgress);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [targetRef]);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Reading Info */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% read
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            {readingTime} min read
          </span>
        </div>
        
        {progress > 90 && (
          <span className="text-sm text-green-600 font-medium animate-pulse">
            Almost done! 🎉
          </span>
        )}
      </div>
    </div>
  );
}

// Minimal progress bar for embedding in headers
export function MinimalReadingProgress({ className = '' }: { className?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight > 0) {
        setProgress((scrollTop / documentHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`h-1 bg-gray-200 ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Hook for tracking reading progress
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight > 0) {
        const currentProgress = (scrollTop / documentHeight) * 100;
        setProgress(Math.min(100, currentProgress));
        setIsComplete(currentProgress > 95);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, isComplete };
}