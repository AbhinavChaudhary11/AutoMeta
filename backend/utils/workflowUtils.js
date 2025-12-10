// Generate unique node ID
export function generateNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validate n8n workflow structure
export function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') {
    return false;
  }

  // Check required top-level fields
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    return false;
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    return false;
  }

  // Validate nodes
  for (const node of workflow.nodes) {
    if (!node.id || !node.name || !node.type || !node.position) {
      return false;
    }
    
    if (!Array.isArray(node.position) || node.position.length !== 2) {
      return false;
    }
  }

  return true;
}

// Ensure all nodes have unique IDs
export function ensureUniqueNodeIds(workflow) {
  const usedIds = new Set();
  
  workflow.nodes = workflow.nodes.map(node => {
    if (usedIds.has(node.id)) {
      node.id = generateNodeId();
    }
    usedIds.add(node.id);
    return node;
  });
  
  return workflow;
}

// Fix workflow connections to ensure all nodes are properly connected
export function fixWorkflowConnections(nodes, connections) {
  if (!nodes || nodes.length === 0) {
    return {};
  }

  // Create a map of node names for quick lookup
  const nodeNames = nodes.map(node => node.name);
  const fixedConnections = {};

  // If no connections exist or connections are incomplete, create them
  if (!connections || Object.keys(connections).length === 0) {
    // Create sequential connections for all nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      if (!fixedConnections[currentNode.name]) {
        fixedConnections[currentNode.name] = { main: [] };
      }
      
      fixedConnections[currentNode.name].main = [[{
        node: nextNode.name,
        type: 'main',
        index: 0
      }]];
    }
  } else {
    // Fix existing connections - ensure node names match exactly
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      // Check if connection exists for this node
      if (connections[currentNode.name]) {
        // Use existing connection but ensure it points to a valid node
        const existingConn = connections[currentNode.name];
        fixedConnections[currentNode.name] = existingConn;
        
        // Verify the target node exists, if not, connect to next node
        if (existingConn.main && existingConn.main[0] && existingConn.main[0][0]) {
          const targetNode = existingConn.main[0][0].node;
          if (!nodeNames.includes(targetNode)) {
            // Target node doesn't exist, fix it to point to next node
            fixedConnections[currentNode.name] = {
              main: [[{ node: nextNode.name, type: 'main', index: 0 }]]
            };
          }
        }
      } else {
        // No connection exists, create one to next node
        fixedConnections[currentNode.name] = {
          main: [[{ node: nextNode.name, type: 'main', index: 0 }]]
        };
      }
    }
    
    // Copy any other connections that might exist
    for (const nodeName in connections) {
      if (!fixedConnections[nodeName] && nodeNames.includes(nodeName)) {
        fixedConnections[nodeName] = connections[nodeName];
      }
    }
  }

  return fixedConnections;
}

