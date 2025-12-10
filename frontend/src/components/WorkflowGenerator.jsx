import { useState, useRef, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import WorkflowEditor from './WorkflowEditor';
import WorkflowPreview from './WorkflowPreview';
import WorkflowVisualPreview from './WorkflowVisualPreview';
import WorkflowExplanation from './WorkflowExplanation';
import FloatingChatButton from './FloatingChatButton';

const API_URL = '/api/workflows';

export default function WorkflowGenerator({ 
  onWorkflowGenerated, 
  initialTemplate,
  savedWorkflow,
  savedExplanation,
  savedDescription,
  onWorkflowSave
}) {
  const [description, setDescription] = useState(savedDescription || '');
  const [workflow, setWorkflow] = useState(savedWorkflow || null);
  const [explanation, setExplanation] = useState(savedExplanation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [workflowJson, setWorkflowJson] = useState(savedWorkflow ? JSON.stringify(savedWorkflow, null, 2) : '');

  // Restore saved workflow when component mounts or savedWorkflow changes
  useEffect(() => {
    if (savedWorkflow) {
      setWorkflow(savedWorkflow);
      setExplanation(savedExplanation);
      setDescription(savedDescription);
      setWorkflowJson(JSON.stringify(savedWorkflow, null, 2));
      setEditing(false);
    }
  }, [savedWorkflow, savedExplanation, savedDescription]);

  useEffect(() => {
    if (initialTemplate) {
      setWorkflow(initialTemplate.workflow);
      setWorkflowJson(JSON.stringify(initialTemplate.workflow, null, 2));
      setDescription(initialTemplate.description || initialTemplate.name);
      setEditing(false);
      // Save template workflow to parent
      if (onWorkflowSave) {
        onWorkflowSave(initialTemplate.workflow, null, initialTemplate.description || initialTemplate.name);
      }
    }
  }, [initialTemplate, onWorkflowSave]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkflow(data.workflow);
        setExplanation(data.explanation || null);
        setWorkflowJson(JSON.stringify(data.workflow, null, 2));
        setEditing(false);
        // Save to parent component to persist across tab changes
        if (onWorkflowSave) {
          onWorkflowSave(data.workflow, data.explanation || null, description);
        }
      } else {
        setError(data.error || 'Failed to generate workflow');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workflow) return;

    try {
      // Use workflow name as description if available, otherwise use the description
      const saveDescription = workflow.name || description || 'Untitled Workflow';
      
      await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: saveDescription,
          workflow,
        }),
      });

      if (onWorkflowGenerated) {
        onWorkflowGenerated();
      }
      
      alert('Workflow saved successfully!');
    } catch (err) {
      alert('Failed to save workflow: ' + err.message);
    }
  };

  const handleDownload = () => {
    if (!workflow) return;

    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n-workflow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!workflowJson) return;
    navigator.clipboard.writeText(workflowJson);
    alert('Workflow JSON copied to clipboard!');
  };

  const handleEdit = () => {
    try {
      const parsed = JSON.parse(workflowJson);
      setWorkflow(parsed);
      setEditing(false);
      setError(null);
      // Update saved workflow when edited
      if (onWorkflowSave) {
        onWorkflowSave(parsed, explanation, description);
      }
    } catch (err) {
      setError('Invalid JSON format: ' + err.message);
    }
  };

  const handleJsonChange = (newJson) => {
    setWorkflowJson(newJson);
    setEditing(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Generate n8n Workflow
            </h2>
            <p className="text-sm text-gray-600 mt-1">Describe your automation and let AI create the workflow</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your automation workflow
            </label>
            <div className="flex space-x-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Send an email notification when a new row is added to Google Sheets"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
              />
              <VoiceInput
                onTranscript={(text) => setDescription((prev) => prev + ' ' + text)}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg font-semibold flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate Workflow</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      {workflow && (
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Generated Workflow</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  📋 Copy JSON
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  💾 Save
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>

            <WorkflowPreview workflow={workflow} />

            {/* Explanation Section - Full Width on Top (if exists) */}
            {explanation && (
              <div className="mt-4">
                <WorkflowExplanation explanation={explanation} />
              </div>
            )}

            {/* Preview and JSON Section - Side by Side (50% each) */}
            <div className={`mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4`}>
              {/* Left Column - Visual Preview */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">📊</span>
                  Visual Preview
                </h4>
                <WorkflowVisualPreview workflow={workflow} />
              </div>
              
              {/* Right Column - JSON Editor */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    JSON {editing && <span className="text-orange-600">(Edited)</span>}
                  </label>
                  {editing && (
                    <button
                      onClick={handleEdit}
                      className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                <WorkflowEditor
                  value={workflowJson}
                  onChange={handleJsonChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {workflow && <FloatingChatButton workflow={workflow} />}
    </div>
  );
}

