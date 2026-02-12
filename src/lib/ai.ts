// Mock AI service - replace with actual TanStack AI integration when configured
// This provides the same interface for development

export interface AIGenerateOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateResult {
  text: string;
}

export interface PostForLinkSuggestion {
  id: string;
  title: string;
  slug: string;
}

// Mock AI functions for development
export async function generateArticle(
  topic: string,
  keywords: string[],
  tone?: string,
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `# ${topic}

## Introduction
This comprehensive guide covers everything you need to know about ${topic}.
Target keywords: ${keywords.join(", ")}

## Key Sections
1. Overview and fundamentals
2. Best practices and strategies
3. Common mistakes to avoid
4. Advanced techniques
5. Conclusion with actionable next steps

## Writing Style
Tone: ${tone || "professional"}
Length: 1000-1500 words
SEO optimized with natural keyword integration`;
}

export async function optimizeContent(
  content: string,
  focusKeyword: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `## Content Optimization Suggestions for "${focusKeyword}"

### Improvements Made:
1. ✓ Keyword density optimized (2-3%)
2. ✓ Added semantic keywords
3. ✓ Improved heading structure
4. ✓ Enhanced readability

### Suggested Additions:
- Include FAQ section
- Add more internal links
- Expand introduction
- Add statistics/data points

### Optimized Excerpt:
${content.substring(0, 200)}...

[Content would be fully optimized here in production]`;
}

export async function generateOutline(
  topic: string,
  keywords: string[],
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return `# ${topic} - Content Outline

## H1: ${topic}
- Compelling title with primary keyword

## H2: Introduction (150-200 words)
- Hook the reader
- State the problem
- Promise the solution

## H2: Main Section 1 (300-400 words)
### H3: Subsection A
### H3: Subsection B

## H2: Main Section 2 (300-400 words)
### H3: Subsection C
### H3: Subsection D

## H2: Main Section 3 (300-400 words)
### H3: Best Practices
### H3: Common Pitfalls

## H2: Conclusion (150-200 words)
- Summarize key points
- Call to action
- Related resources

Keywords: ${keywords.join(", ")}
Estimated total: 1200-1500 words`;
}

export async function suggestKeywords(
  content: string,
  topic: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return `{
  "primary_keyword": "${topic.toLowerCase().replace(/\s+/g, "-")}",
  "secondary_keywords": [
    "best practices",
    "complete guide",
    "how to",
    "tips and tricks",
    "strategies"
  ],
  "long_tail_keywords": [
    "how to get started with ${topic}",
    "${topic} best practices 2024",
    "complete guide to ${topic}",
    "common ${topic} mistakes",
    "advanced ${topic} techniques"
  ],
  "search_intent": "informational",
  "keyword_difficulty": "medium",
  "content_gaps": [
    "Missing comparison section",
    "No FAQ section",
    "Lack of statistics",
    "Missing case studies"
  ]
}`;
}

export async function improveReadability(content: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return `## Readability Improvements

### Changes Made:
1. ✓ Shortened long sentences (avg 18 words → 15 words)
2. ✓ Added transition phrases
3. ✓ Converted passive voice to active
4. ✓ Simplified complex terms
5. ✓ Added bullet points for lists

### Metrics:
- Flesch-Kincaid: Improved from 45 to 58
- Reading time: Optimized for 3-5 minutes
- Paragraph length: 2-4 sentences each

[Improved content would be inserted here]`;
}

export async function generateMetaTags(
  content: string,
  title: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return `## Generated Meta Tags

### Meta Title (56 chars):
${title} | Complete Guide 2024

### Meta Description (158 chars):
Learn everything about ${title.toLowerCase()} in this comprehensive guide. Discover best practices, common mistakes to avoid, and expert tips for success.

### Open Graph:
- Title: ${title}: The Ultimate Guide
- Description: Master ${title.toLowerCase()} with our comprehensive resource

### Twitter Card:
- Title: ${title} Guide
- Description: Everything you need to know about ${title.toLowerCase()}

### Focus Keyword:
${title.toLowerCase().replace(/\s+/g, "-")}`;
}

export async function createFAQ(
  topic: string,
  content: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ${topic}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${topic} refers to..."
      }
    },
    {
      "@type": "Question",
      "name": "How do I get started with ${topic}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To get started with ${topic}, you should..."
      }
    },
    {
      "@type": "Question",
      "name": "What are the benefits of ${topic}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The main benefits include..."
      }
    },
    {
      "@type": "Question",
      "name": "What are common mistakes to avoid?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Common mistakes include..."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to see results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Results typically appear within..."
      }
    }
  ]
}
</script>`;
}

export async function suggestInternalLinks(
  content: string,
  allPosts: PostForLinkSuggestion[],
): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  // In a real scenario, the AI would analyze the content and find relevant links.
  // Here, we'll just return a few mock suggestions.
  const suggestions = allPosts.slice(0, 3).map((post) => ({
    text: `Consider linking to "${post.title}"`,
    url: `../${post.slug}`,
    relevance: Math.random().toFixed(2),
  }));

  return {
    suggestions: suggestions,
    analysis: "Based on the content, these posts seem contextually relevant.",
  };
}

// Content prompts object for compatibility
export const contentPrompts = {
  generateArticle: (topic: string, keywords: string[], tone?: string) =>
    `Generate article about ${topic}`,
  optimizeContent: (content: string, focusKeyword: string) =>
    `Optimize for ${focusKeyword}`,
  generateOutline: (topic: string, keywords: string[]) =>
    `Outline for ${topic}`,
  suggestKeywords: (content: string, topic: string) => `Keywords for ${topic}`,
  improveReadability: (content: string) => `Improve readability`,
  generateMetaTags: (content: string, title: string) => `Meta for ${title}`,
  createFAQ: (topic: string, content: string) => `FAQ for ${topic}`,
  suggestInternalLinks: (content: string, allPosts: PostForLinkSuggestion[]) =>
    `Suggest internal links from content`,
};

// Mock AI object for compatibility
export const ai = {
  generate: async (options: AIGenerateOptions): Promise<AIGenerateResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      text: `Generated content for: ${options.prompt.substring(0, 50)}...`,
    };
  },
};
