interface SEOStatusBarProps {
  score: number;
  wordCount: number;
  readingTime: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    field: string;
    recommendation: string;
  }>;
  suggestions: string[];
}

export default function SEOStatusBar({
  score,
  wordCount,
  readingTime,
  issues,
  suggestions,
}: SEOStatusBarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-600">SEO Score</span>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}/100
              </span>
              <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {wordCount} words • {readingTime} min read
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Issues to Fix</h4>
          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 p-3 rounded-md ${
                  issue.type === 'error' ? 'bg-red-50 border-red-200' :
                  issue.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    issue.type === 'error' ? 'bg-red-600' :
                    issue.type === 'warning' ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    issue.type === 'error' ? 'text-red-900' :
                    issue.type === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {issue.message}
                  </div>
                  <div className={`text-xs ${
                    issue.type === 'error' ? 'text-red-700' :
                    issue.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {issue.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Suggestions</h4>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-blue-900">
                    {suggestion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfect Score Badge */}
      {score >= 100 && (
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✨ Perfect SEO Score!
          </div>
        </div>
      )}
    </div>
  );
}