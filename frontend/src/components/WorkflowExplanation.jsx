import ReactMarkdown from 'react-markdown';

export default function WorkflowExplanation({ explanation }) {
  if (!explanation) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200 shadow-md h-full flex flex-col">
      <div className="flex items-center mb-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 mr-2 shadow-sm">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 shadow-inner border border-gray-100 flex-1 overflow-y-auto">
        <div className="prose prose-sm prose-indigo max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 first:mt-0" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-indigo-700 mt-5 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-700 mt-3 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-gray-700 leading-7 mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              li: ({ node, ...props }) => <li className="ml-4 mb-1 leading-6" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
              em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
              code: ({ node, ...props }) => <code className="bg-gray-100 text-indigo-700 px-2 py-1 rounded text-sm font-mono" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-gray-600 my-4" {...props} />,
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

