import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles based on node type
const getNodeStyle = (nodeType) => {
  const typeStyles = {
    'n8n-nodes-base.webhook': { background: '#ff6b6b', color: '#fff' },
    'n8n-nodes-base.start': { background: '#4ecdc4', color: '#fff' },
    'n8n-nodes-base.emailSend': { background: '#45b7d1', color: '#fff' },
    'n8n-nodes-base.set': { background: '#96ceb4', color: '#fff' },
    'n8n-nodes-base.httpRequest': { background: '#ffeaa7', color: '#333' },
    'n8n-nodes-base.slack': { background: '#4a5568', color: '#fff' },
    'n8n-nodes-base.googleSheets': { background: '#48bb78', color: '#fff' },
  };

  const defaultStyle = { background: '#a0aec0', color: '#fff' };
  return typeStyles[nodeType] || defaultStyle;
};

// Convert n8n workflow to React Flow format
function convertToReactFlow(workflow) {
  if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = workflow.nodes.map((node, index) => {
    const style = getNodeStyle(node.type);
    
    return {
      id: node.id || `node-${index}`,
      type: 'default',
      position: { x: node.position[0] || 250 + index * 200, y: node.position[1] || 300 },
      data: {
        label: (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              {node.name}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {node.type.split('.').pop()}
            </div>
          </div>
        ),
      },
      style: {
        background: style.background,
        color: style.color,
        border: '2px solid #2d3748',
        borderRadius: '8px',
        minWidth: '150px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    };
  });

  const edges = [];
  
  if (workflow.connections) {
    Object.keys(workflow.connections).forEach((sourceNodeName) => {
      const connection = workflow.connections[sourceNodeName];
      
      if (connection && connection.main && connection.main[0]) {
        connection.main[0].forEach((target) => {
          const sourceNode = workflow.nodes.find(n => n.name === sourceNodeName);
          const targetNode = workflow.nodes.find(n => n.name === target.node);
          
          if (sourceNode && targetNode) {
            edges.push({
              id: `edge-${sourceNode.id}-${targetNode.id}`,
              source: sourceNode.id || `node-${workflow.nodes.indexOf(sourceNode)}`,
              target: targetNode.id || `node-${workflow.nodes.indexOf(targetNode)}`,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#4a5568', strokeWidth: 2 },
              markerEnd: {
                type: 'arrowclosed',
                color: '#4a5568',
              },
            });
          }
        });
      }
    });
  } else {
    // If no connections defined, create sequential connections
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}-${i + 1}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#4a5568', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#4a5568',
        },
      });
    }
  }

  return { nodes, edges };
}

export default function WorkflowVisualPreview({ workflow }) {
  const { nodes, edges } = useMemo(() => {
    if (!workflow) return { nodes: [], edges: [] };
    try {
      return convertToReactFlow(workflow);
    } catch (error) {
      console.error('Error converting workflow to visual format:', error);
      return { nodes: [], edges: [] };
    }
  }, [workflow]);

  if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        <p>No workflow to preview. Generate a workflow to see the visual preview.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200" style={{ height: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        style={{ background: '#f7fafc', borderRadius: '8px' }}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />

      </ReactFlow>
    </div>
  );
}

