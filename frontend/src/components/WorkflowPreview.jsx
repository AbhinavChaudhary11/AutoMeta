export default function WorkflowPreview({ workflow }) {
  if (!workflow || !workflow.nodes) {
    return null;
  }

  const nodeCount = workflow.nodes.length;
  const connectionCount = Object.keys(workflow.connections || {}).length;

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{nodeCount}</div>
          <div className="text-sm text-gray-600">Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{connectionCount}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{workflow.name || 'Untitled'}</div>
          <div className="text-sm text-gray-600">Workflow Name</div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Nodes:</h4>
        <div className="flex flex-wrap gap-2">
          {workflow.nodes.map((node, index) => (
            <span
              key={node.id || index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
            >
              {node.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

