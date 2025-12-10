import { useState, useEffect } from 'react';
import WorkflowGenerator from './components/WorkflowGenerator';
import WorkflowHistory from './components/WorkflowHistory';
import WorkflowTemplates from './components/WorkflowTemplates';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // Persist workflow state across tab changes
  const [savedWorkflow, setSavedWorkflow] = useState(null);
  const [savedExplanation, setSavedExplanation] = useState(null);
  const [savedDescription, setSavedDescription] = useState('');

  useEffect(() => {
    fetchWorkflowHistory();
  }, []);

  const fetchWorkflowHistory = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      if (data.success) {
        setWorkflowHistory(data.workflows);
      }
    } catch (error) {
      console.error('Error fetching workflow history:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setActiveTab('generate');
  };

  const handlePreviewWorkflow = (workflow) => {
    // Set the workflow data and switch to generate tab
    setSavedWorkflow(workflow.workflow);
    setSavedDescription(workflow.description || '');
    setSavedExplanation(null); // History workflows don't have explanation
    setActiveTab('generate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🤖 Autometa
              </h1>
              <p className="text-gray-600 mt-1 text-sm">AI-Powered n8n Workflow Generator</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">✓ Gemini 2.5</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">⚡ Fast</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setActiveTab('generate');
                setSelectedTemplate(null);
              }}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-all rounded-t-lg ${
                activeTab === 'generate'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              ✨ Generate Workflow
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-all rounded-t-lg ${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchWorkflowHistory();
              }}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-all rounded-t-lg ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📜 History
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-4 py-4">
        {activeTab === 'generate' && (
          <WorkflowGenerator 
            onWorkflowGenerated={fetchWorkflowHistory}
            initialTemplate={selectedTemplate}
            savedWorkflow={savedWorkflow}
            savedExplanation={savedExplanation}
            savedDescription={savedDescription}
            onWorkflowSave={(workflow, explanation, description) => {
              setSavedWorkflow(workflow);
              setSavedExplanation(explanation);
              setSavedDescription(description);
            }}
          />
        )}
        {activeTab === 'templates' && (
          <WorkflowTemplates onTemplateSelect={handleTemplateSelect} />
        )}
        {activeTab === 'history' && (
          <WorkflowHistory 
            workflows={workflowHistory} 
            onPreviewWorkflow={handlePreviewWorkflow}
            onWorkflowDeleted={fetchWorkflowHistory}
          />
        )}
      </main>
    </div>
  );
}

export default App;

