// SEO scoring algorithm
export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  suggestions: string[];
  readabilityScore: number;
  wordCount: number;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field: string;
  recommendation: string;
}

export function analyzeSEO(content: string, title: string, metaDescription: string): SEOAnalysis {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Content analysis
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Title analysis
  if (!title || title.length < 10) {
    issues.push({
      type: 'error',
      message: title ? 'Title is too short (minimum 10 characters)' : 'Title is missing',
      field: 'title',
      recommendation: 'Add a descriptive title between 10-60 characters'
    });
    score -= 20;
  } else if (title.length > 60) {
    issues.push({
      type: 'warning',
      message: 'Title is too long (over 60 characters)',
      field: 'title',
      recommendation: 'Shorten title to under 60 characters'
    });
    score -= 10;
  }

  // Meta description analysis
  if (!metaDescription || metaDescription.length < 50) {
    issues.push({
      type: 'error',
      message: metaDescription ? 'Meta description is too short (minimum 50 characters)' : 'Meta description is missing',
      field: 'metaDescription',
      recommendation: 'Add a compelling description between 50-160 characters'
    });
    score -= 15;
  } else if (metaDescription.length > 160) {
    issues.push({
      type: 'warning',
      message: 'Meta description is too long (over 160 characters)',
      field: 'metaDescription',
      recommendation: 'Shorten description to under 160 characters'
    });
    score -= 5;
  }

  // Content length analysis
  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      message: 'Content is quite short (less than 300 words)',
      field: 'content',
      recommendation: 'Aim for at least 300 words for better SEO'
    });
    score -= 10;
  }

  // Heading structure analysis
  const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
  const h1Count = (content.match(/<h1/gi) || []).length;
  const h2Count = (content.match(/<h2/gi) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length;

  if (!h1Count) {
    issues.push({
      type: 'error',
      message: 'No H1 heading found',
      field: 'content',
      recommendation: 'Add one H1 heading that contains your primary keyword'
    });
    score -= 25;
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      message: 'Multiple H1 headings found',
      field: 'content',
      recommendation: 'Use only one H1 heading per page'
    });
    score -= 10;
  }

  if (h2Count === 0 && h3Count > 0) {
    issues.push({
      type: 'warning',
      message: 'Found H3 headings but no H2 headings',
      field: 'content',
      recommendation: 'Use proper heading hierarchy (H1 → H2 → H3)'
    });
    score -= 5;
  }

  // Image analysis
  const images = content.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
  
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'warning',
      message: `${imagesWithoutAlt.length} images missing alt text`,
      field: 'content',
      recommendation: 'Add descriptive alt text to all images'
    });
    score -= imagesWithoutAlt.length * 2;
  }

  // Internal links analysis
  const internalLinks = (content.match(/<a[^>]*href="\/[^"]*"[^>]*>/gi) || []).length;
  if (internalLinks < 2) {
    issues.push({
      type: 'info',
      message: 'Few internal links found',
      field: 'content',
      recommendation: 'Add more internal links to improve navigation and SEO'
    });
    score -= 5;
  }

  // Readability score (Flesch-Kincaid approximation)
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / sentences.length;
  const avgSentenceLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  
  let readabilityScore = 100;
  
  // Penalty for very long sentences
  const longSentences = sentences.filter(sentence => words.length > 20);
  if (longSentences.length > 0) {
    readabilityScore -= (longSentences.length / sentences.length) * 30;
  }
  
  // Penalty for very long words
  const longWords = words.filter(word => word.length > 12);
  if (longWords.length > 0) {
    readabilityScore -= (longWords.length / wordCount) * 20;
  }

  const suggestions = generateSuggestions(issues, score);

  return {
    score: Math.max(0, Math.min(100, score)),
    issues: issues.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.type] - severityOrder[b.type];
    }),
    suggestions,
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
    wordCount,
    readingTime,
  };
}

function generateSuggestions(issues: SEOIssue[], currentScore: number): string[] {
  const suggestions: string[] = [];
  
  if (currentScore < 60) {
    suggestions.push('Focus on improving content length and structure');
  }
  
  if (issues.some(issue => issue.field === 'title')) {
    suggestions.push('Optimize your title for search engines and click-through rates');
  }
  
  if (issues.some(issue => issue.field === 'metaDescription')) {
    suggestions.push('Write a compelling meta description that encourages clicks');
  }
  
  if (issues.some(issue => issue.field === 'content' && issue.message.includes('heading'))) {
    suggestions.push('Structure content with proper heading hierarchy (H1 → H2 → H3)');
  }
  
  if (issues.some(issue => issue.message.includes('alt text'))) {
    suggestions.push('Add descriptive alt text to improve accessibility and SEO');
  }
  
  if (issues.some(issue => issue.message.includes('internal links'))) {
    suggestions.push('Build internal linking to improve navigation and distribute page authority');
  }
  
  return suggestions;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  const cleaned = plainText.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return cleaned.substring(0, maxLength - 3) + '...';
}