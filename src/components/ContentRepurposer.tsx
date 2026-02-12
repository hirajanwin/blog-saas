import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateArticle, suggestKeywords } from '@/lib/ai';

interface RepurposeOptions {
  type: 'twitter-thread' | 'linkedin-post' | 'newsletter' | 'summary' | 'faq' | 'quotes';
  tone: 'professional' | 'casual' | 'enthusiastic';
  length: 'short' | 'medium' | 'long';
}

interface ContentRepurposerProps {
  content: string;
  title: string;
  onRepurpose: (repurposedContent: string, type: string) => void;
}

export default function ContentRepurposer({
  content,
  title,
  onRepurpose,
}: ContentRepurposerProps) {
  const [options, setOptions] = useState<RepurposeOptions>({
    type: 'twitter-thread',
    tone: 'professional',
    length: 'medium',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const repurposingTypes = [
    { id: 'twitter-thread', name: 'Twitter/X Thread', icon: '🐦', description: 'Break into 280-char tweets' },
    { id: 'linkedin-post', name: 'LinkedIn Post', icon: '💼', description: 'Professional social post' },
    { id: 'newsletter', name: 'Email Newsletter', icon: '📧', description: 'Email-friendly format' },
    { id: 'summary', name: 'Executive Summary', icon: '📝', description: 'Key points in brief' },
    { id: 'faq', name: 'FAQ Section', icon: '❓', description: 'Questions and answers' },
    { id: 'quotes', name: 'Quote Graphics', icon: '💬', description: 'Shareable quotes' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let generated = '';
      
      switch (options.type) {
        case 'twitter-thread':
          generated = generateTwitterThread(content, title);
          break;
        case 'linkedin-post':
          generated = generateLinkedInPost(content, title);
          break;
        case 'newsletter':
          generated = generateNewsletter(content, title);
          break;
        case 'summary':
          generated = generateSummary(content, title);
          break;
        case 'faq':
          generated = generateFAQ(content, title);
          break;
        case 'quotes':
          generated = generateQuotes(content, title);
          break;
      }
      
      setResult(generated);
      setIsGenerating(false);
    }, 1500);
  };

  const generateTwitterThread = (content: string, title: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
    
    let thread = `🧵 ${title}\n\n`;
    let tweetCount = 1;
    let currentTweet = '';
    
    sentences.slice(0, 10).forEach((sentence) => {
      if ((currentTweet + sentence).length < 260) {
        currentTweet += sentence + ' ';
      } else {
        thread += `${tweetCount}/ ${currentTweet.trim()}\n\n`;
        tweetCount++;
        currentTweet = sentence + ' ';
      }
    });
    
    if (currentTweet) {
      thread += `${tweetCount}/ ${currentTweet.trim()}\n\n`;
    }
    
    thread += `What do you think? Let me know in the comments! 👇\n\n#${title.toLowerCase().replace(/\s+/g, '')} #thread`;
    
    return thread;
  };

  const generateLinkedInPost = (content: string, title: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const excerpt = plainText.substring(0, 300);
    
    return `I just published an article on "${title}" and wanted to share the key insights:\n\n${excerpt}...\n\nHere are 3 things I learned:\n\n1. [Key insight 1]\n2. [Key insight 2]\n3. [Key insight 3]\n\nThe full article dives deeper into each point with actionable strategies you can implement today.\n\nWhat's your experience with this topic? I'd love to hear your thoughts in the comments!\n\n#${title.toLowerCase().replace(/\s+/g, '')} #insights #learning`;
  };

  const generateNewsletter = (content: string, title: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    
    return `Subject: ${title} + 3 insights you can't miss\n\nHi [First Name],\n\nHope you're having a great week!\n\nI just published a new article on ${title} and wanted to share the highlights with you.\n\n**In this week's issue:**\n• The biggest mistake most people make\n• A framework that actually works\n• Actionable tips you can use today\n\n**The Big Idea**\n${plainText.substring(0, 200)}...\n\n[Read the full article →]\n\n**Quick Wins**\nHere are 3 things you can do right now:\n\n1. [Action item 1]\n2. [Action item 2]\n3. [Action item 3]\n\nThat's it for this week!\n\nHappy reading,\n[Your Name]`;
  };

  const generateSummary = (content: string, title: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/);
    
    return `# Executive Summary: ${title}\n\n## TL;DR\n${plainText.substring(0, 150)}...\n\n## Key Points\n\n1. **Main Argument:** The article explores...\n2. **Key Finding:** Research shows...\n3. **Practical Application:** Readers can...\n4. **Conclusion:** The future of...\n\n## Word Count\nOriginal: ${words.length} words\nSummary: ~150 words\nReading time: 30 seconds\n\n## Target Audience\nBusy professionals who need the gist without reading the full ${Math.ceil(words.length / 200)}-minute article.`;
  };

  const generateFAQ = (content: string, title: string) => {
    return `# Frequently Asked Questions: ${title}\n\n**Q: What is the main topic covered in this article?**\nA: This article provides a comprehensive guide to...\n\n**Q: Who is this article for?**\nA: This content is designed for...\n\n**Q: What are the key takeaways?**\nA: The main points include...\n\n**Q: How can I apply these insights?**\nA: You can start by...\n\n**Q: Where can I learn more?**\nA: Check out the related resources section or subscribe for updates.`;
  };

  const generateQuotes = (content: string, title: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
    const quotes = sentences
      .filter(s => s.length > 40 && s.length < 150)
      .slice(0, 5);
    
    return `# Shareable Quotes from "${title}"\n\n${quotes.map((quote, i) => `${i + 1}. "${quote.trim()}"`).join('\n\n')}\n\n---\n\n💡 **Pro tip:** Pair these with eye-catching graphics for maximum engagement on social media!`;
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Content Repurposer
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Transform your article into different formats for various platforms. One piece of content, multiple uses!
      </p>

      {/* Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {repurposingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setOptions({ ...options, type: type.id as RepurposeOptions['type'] })}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  options.type === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-gray-900 text-sm">{type.name}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={options.tone}
              onChange={(e) => setOptions({ ...options, tone: e.target.value as RepurposeOptions['tone'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <select
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: e.target.value as RepurposeOptions['length'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full mb-4"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Repurposed Content'
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Generated Content</h4>
            <button
              onClick={copyToClipboard}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRepurpose(result, options.type)}
              className="flex-1"
            >
              Save as New Post
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Pro tip:</strong> Repurposing content can increase your reach by 3-5x. 
          A single blog post can become: a Twitter thread, LinkedIn post, newsletter, and more!
        </p>
      </div>
    </div>
  );
}

export type { RepurposeOptions };