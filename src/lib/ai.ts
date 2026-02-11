import { createAI } from '@tanstack/ai';
import { openai } from '@ai-sdk/openai';

// Initialize AI with OpenAI provider
export const ai = createAI({
  provider: openai,
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
});

// Content generation prompts
export const contentPrompts = {
  generateArticle: (topic: string, keywords: string[], tone: string = 'professional') => `
You are an expert SEO content writer. Create a comprehensive blog article about "${topic}".

Requirements:
- Target keywords: ${keywords.join(', ')}
- Tone: ${tone}
- Structure: Include H1, H2, and H3 headings
- Length: 800-1500 words
- Style: Engaging, informative, optimized for search engines
- Format: Use markdown formatting

Please generate a well-structured article with:
1. Compelling title (H1)
2. Introduction paragraph
3. 3-5 main sections (H2)
4. Subsections where appropriate (H3)
5. Conclusion with call-to-action
6. Meta title (60 chars max)
7. Meta description (160 chars max)

Make sure to naturally incorporate the keywords without keyword stuffing.`,

  optimizeContent: (content: string, focusKeyword: string) => `
You are an SEO expert. Optimize the following content for the focus keyword "${focusKeyword}".

Current content:
${content}

Please provide:
1. Improved title suggestions
2. Better meta description
3. Content enhancements for keyword density
4. Internal linking opportunities
5. Additional sections to add
6. Readability improvements

Return the optimized content in the same format with clear suggestions for improvements.`,

  generateOutline: (topic: string, keywords: string[]) => `
Create a detailed blog post outline for: "${topic}"

Target keywords: ${keywords.join(', ')}

Requirements:
- H1 title
- 3-5 main sections (H2)
- Subsections where needed (H3)
- Key points to cover in each section
- Estimated word count per section
- Suggested internal links

Format as a structured outline ready for content creation.`,

  suggestKeywords: (content: string, topic: string) => `
Analyze this content and suggest SEO keywords:

Topic: ${topic}
Content: ${content.substring(0, 1000)}...

Please provide:
1. Primary keyword (1)
2. Secondary keywords (3-5)
3. Long-tail keywords (5-10)
4. Search intent for each
5. Keyword difficulty estimation
6. Content gaps to address

Format as JSON with explanations.`,

  improveReadability: (content: string) => `
Improve the readability of this content:

${content}

Focus on:
1. Sentence length (aim for 15-20 words average)
2. Paragraph structure (2-4 sentences per paragraph)
3. Transition words and phrases
4. Active voice usage
5. Flesch-Kincaid score improvement
6. Clear headings and subheadings

Return the improved content with specific changes highlighted.`,

  generateMetaTags: (content: string, title: string) => `
Generate optimized meta tags for this content:

Title: ${title}
Content excerpt: ${content.substring(0, 500)}...

Please provide:
1. Meta title (50-60 characters, includes primary keyword)
2. Meta description (150-160 characters, compelling, includes CTA)
3. Open Graph title
4. Open Graph description
5. Twitter Card title
6. Twitter Card description
7. Suggested focus keyword

Make them click-worthy and SEO-optimized.`,

  createFAQ: (topic: string, content: string) => `
Generate FAQ schema markup based on this content:

Topic: ${topic}
Content: ${content.substring(0, 1000)}...

Create 5-7 relevant questions and answers that:
1. Address common user queries
2. Are based on the content provided
3. Use natural language
4. Include target keywords naturally
5. Provide clear, concise answers

Format as JSON-LD FAQPage schema.`,
};

// AI content generation functions
export async function generateArticle(topic: string, keywords: string[], tone?: string) {
  const prompt = contentPrompts.generateArticle(topic, keywords, tone);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return result.text;
}

export async function optimizeContent(content: string, focusKeyword: string) {
  const prompt = contentPrompts.optimizeContent(content, focusKeyword);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.6,
    maxTokens: 2000,
  });

  return result.text;
}

export async function generateOutline(topic: string, keywords: string[]) {
  const prompt = contentPrompts.generateOutline(topic, keywords);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.5,
    maxTokens: 1000,
  });

  return result.text;
}

export async function suggestKeywords(content: string, topic: string) {
  const prompt = contentPrompts.suggestKeywords(content, topic);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.3,
    maxTokens: 800,
  });

  return result.text;
}

export async function improveReadability(content: string) {
  const prompt = contentPrompts.improveReadability(content);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.4,
    maxTokens: 1500,
  });

  return result.text;
}

export async function generateMetaTags(content: string, title: string) {
  const prompt = contentPrompts.generateMetaTags(content, title);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.5,
    maxTokens: 500,
  });

  return result.text;
}

export async function createFAQ(topic: string, content: string) {
  const prompt = contentPrompts.createFAQ(topic, content);
  
  const result = await ai.generate({
    prompt,
    temperature: 0.4,
    maxTokens: 1000,
  });

  return result.text;
}