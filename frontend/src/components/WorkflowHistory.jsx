import { useState } from 'react';

const API_URL = '/api/workflows';

export default function WorkflowHistory({ workflows, onPreviewWorkflow, onWorkflowDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (workflowId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    setDeletingId(workflowId);

    try {
      const response = await fetch(`${API_URL}/${workflowId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Call callback to refresh the list
        if (onWorkflowDeleted) {
          onWorkflowDeleted();
        } else {
          // Fallback to page reload
          window.location.reload();
        }
      } else {
        alert('Failed to delete workflow: ' + (data.error || 'Unknown error'));
        setDeletingId(null);
      }
    } catch (error) {
      alert('Error deleting workflow: ' + error.message);
      setDeletingId(null);
    }
  };

  const handlePreview = (workflow) => {
    if (onPreviewWorkflow) {
      onPreviewWorkflow(workflow);
    }
  };

  if (!workflows || workflows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-medium">No saved workflows yet</p>
        <p className="text-gray-500 text-sm mt-2">Generate and save a workflow to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Saved Workflows
          </h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {workflows.length} {workflows.length === 1 ? 'workflow' : 'workflows'}
          </span>
        </div>

        <div className="space-y-2">
          {workflows.map((workflow) => (
            <div
              key={workflow._id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {workflow.workflow?.name || workflow.description || 'Untitled Workflow'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(workflow.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handlePreview(workflow)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview</span>
                </button>
                <button
                  onClick={(e) => handleDelete(workflow._id, e)}
                  disabled={deletingId === workflow._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                >
                  {deletingId === workflow._id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
