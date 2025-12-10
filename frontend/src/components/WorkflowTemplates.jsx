import { useState } from 'react';

const templates = [
  {
    id: 'email-notification',
    name: 'Email Notification',
    description: 'Send an email when triggered',
    workflow: {
      name: 'Email Notification',
      nodes: [
        {
          id: 'webhook-1',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            path: 'email-trigger',
            httpMethod: 'POST'
          }
        },
        {
          id: 'email-1',
          name: 'Send Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            to: '{{ $json.email }}',
            subject: '{{ $json.subject }}',
            text: '{{ $json.message }}'
          }
        }
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
        }
      },
      active: false,
      settings: {},
      staticData: null,
      tags: []
    }
  },
  {
    id: 'google-sheets-update',
    name: 'Google Sheets Update',
    description: 'Add a new row to Google Sheets when triggered',
    workflow: {
      name: 'Google Sheets Update',
      nodes: [
        {
          id: 'webhook-2',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            path: 'sheets-trigger',
            httpMethod: 'POST'
          }
        },
        {
          id: 'sheets-1',
          name: 'Google Sheets',
          type: 'n8n-nodes-base.googleSheets',
          typeVersion: 4,
          position: [450, 300],
          parameters: {
            operation: 'append',
            spreadsheetId: '{{ $env.GOOGLE_SHEETS_ID }}',
            sheetName: 'Sheet1',
            columns: {
              mappingMode: 'defineBelow',
              value: {
                column1: '={{ $json.name }}',
                column2: '={{ $json.email }}',
                column3: '={{ $json.message }}'
              }
            }
          }
        }
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Google Sheets', type: 'main', index: 0 }]]
        }
      },
      active: false,
      settings: {},
      staticData: null,
      tags: []
    }
  },
  {
    id: 'slack-notification',
    name: 'Slack Notification',
    description: 'Send a message to Slack channel',
    workflow: {
      name: 'Slack Notification',
      nodes: [
        {
          id: 'webhook-3',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            path: 'slack-trigger',
            httpMethod: 'POST'
          }
        },
        {
          id: 'slack-1',
          name: 'Slack',
          type: 'n8n-nodes-base.slack',
          typeVersion: 2,
          position: [450, 300],
          parameters: {
            channel: '#general',
            text: '={{ $json.message }}',
            otherOptions: {}
          }
        }
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Slack', type: 'main', index: 0 }]]
        }
      },
      active: false,
      settings: {},
      staticData: null,
      tags: []
    }
  },
  {
    id: 'data-transformation',
    name: 'Data Transformation',
    description: 'Transform and process incoming data',
    workflow: {
      name: 'Data Transformation',
      nodes: [
        {
          id: 'webhook-4',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {}
        },
        {
          id: 'set-1',
          name: 'Set',
          type: 'n8n-nodes-base.set',
          typeVersion: 3,
          position: [450, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'processedData',
                  value: '={{ $json.data.toUpperCase() }}'
                }
              ]
            }
          }
        },
        {
          id: 'http-1',
          name: 'HTTP Request',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [650, 300],
          parameters: {
            method: 'POST',
            url: 'https://api.example.com/process',
            bodyParameters: {
              parameters: [
                {
                  name: 'data',
                  value: '={{ $json.processedData }}'
                }
              ]
            }
          }
        }
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Set', type: 'main', index: 0 }]]
        },
        Set: {
          main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]]
        }
      },
      active: false,
      settings: {},
      staticData: null,
      tags: []
    }
  }
];

export default function WorkflowTemplates({ onTemplateSelect }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleDownload = (template) => {
    const blob = new Blob([JSON.stringify(template.workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n-workflow-${template.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Workflow Templates
        </h2>
        <p className="text-gray-600 mb-6">
          Choose from pre-built templates to get started quickly
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Use Template
                </button>
                <button
                  onClick={() => handleDownload(template)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Template Selected: {selectedTemplate.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Switch to the "Generate Workflow" tab to see and edit this template.
          </p>
        </div>
      )}
    </div>
  );
}

