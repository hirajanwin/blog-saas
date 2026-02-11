import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateArticle, optimizeContent, generateOutline, suggestKeywords, improveReadability, generateMetaTags } from '@/lib/ai';

interface AIContentAssistantProps {
  content: string;
  title: string;
  onContentUpdate: (newContent: string) => void;
  onTitleUpdate?: (newTitle: string) => void;
  onMetaUpdate?: (meta: { title: string; description: string }) => void;
}

export default function AIContentAssistant({
  content,
  title,
  onContentUpdate,
  onTitleUpdate,
  onMetaUpdate,
}: AIContentAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'optimize' | 'keywords' | 'meta'>('generate');
  const [inputTopic, setInputTopic] = useState('');
  const [inputKeywords, setInputKeywords] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateArticle = async () => {
    if (!inputTopic) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const keywords = inputKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const result = await generateArticle(inputTopic, keywords);
      setAiResult(result);
    } catch (err) {
      setError('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!content || !inputKeywords) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const focusKeyword = inputKeywords.split(',')[0].trim();
      const result = await optimizeContent(content, focusKeyword);
      setAiResult(result);
    } catch (err) {
      setError('Failed to optimize content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!inputTopic) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const keywords = inputKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const result = await generateOutline(inputTopic, keywords);
      setAiResult(result);
    } catch (err) {
      setError('Failed to generate outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!content) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await suggestKeywords(content, title || inputTopic);
      setAiResult(result);
    } catch (err) {
      setError('Failed to suggest keywords. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveReadability = async () => {
    if (!content) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await improveReadability(content);
      setAiResult(result);
    } catch (err) {
      setError('Failed to improve readability. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMeta = async () => {
    if (!content || !title) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateMetaTags(content, title);
      setAiResult(result);
    } catch (err) {
      setError('Failed to generate meta tags. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyResult = () => {
    if (aiResult) {
      onContentUpdate(aiResult);
      setAiResult(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Content Assistant
      </h3>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {(['generate', 'optimize', 'keywords', 'meta'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'generate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic / Title
              </label>
              <input
                type="text"
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                placeholder="e.g., Best Practices for React Development"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={inputKeywords}
                onChange={(e) => setInputKeywords(e.target.value)}
                placeholder="e.g., react, javascript, web development"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleGenerateArticle}
                disabled={isGenerating || !inputTopic}
                className="flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate Full Article'}
              </Button>
              <Button
                onClick={handleGenerateOutline}
                disabled={isGenerating || !inputTopic}
                variant="outline"
              >
                Generate Outline
              </Button>
            </div>
          </>
        )}

        {activeTab === 'optimize' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Keyword
              </label>
              <input
                type="text"
                value={inputKeywords}
                onChange={(e) => setInputKeywords(e.target.value)}
                placeholder="Primary keyword to optimize for"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleOptimizeContent}
                disabled={isGenerating || !content || !inputKeywords}
                className="flex-1"
              >
                {isGenerating ? 'Optimizing...' : 'Optimize Content'}
              </Button>
              <Button
                onClick={handleImproveReadability}
                disabled={isGenerating || !content}
                variant="outline"
              >
                Improve Readability
              </Button>
            </div>
          </>
        )}

        {activeTab === 'keywords' && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your content and get keyword suggestions for better SEO.
            </p>
            <Button
              onClick={handleSuggestKeywords}
              disabled={isGenerating || !content}
              className="w-full"
            >
              {isGenerating ? 'Analyzing...' : 'Suggest Keywords'}
            </Button>
          </>
        )}

        {activeTab === 'meta' && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Generate optimized meta tags based on your content.
            </p>
            <Button
              onClick={handleGenerateMeta}
              disabled={isGenerating || !content || !title}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Meta Tags'}
            </Button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* AI Result */}
      {aiResult && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Generated Content</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</pre>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button onClick={applyResult} className="flex-1">
              Apply to Editor
            </Button>
            <Button onClick={() => setAiResult(null)} variant="outline">
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Pro tip:</strong> Start with an outline, then expand each section. 
          Use the optimize feature to improve existing content for specific keywords.
        </p>
      </div>
    </div>
  );
}