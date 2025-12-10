import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Workflow from '../models/Workflow.js';
import { generateNodeId, validateWorkflow, fixWorkflowConnections } from '../utils/workflowUtils.js';

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
let model = null;

function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Initializing Gemini AI...');
  console.log('API Key present:', !!apiKey, apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY not found or not set. Workflow generation will be limited.');
    model = null;
    return;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 2.5 models - try gemini-2.5-pro first, then gemini-2.5-flash, with fallbacks
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✓ Gemini AI initialized successfully with model: ${modelName}`);
        return;
      } catch (e) {
        console.warn(`Failed to initialize ${modelName}:`, e.message);
        continue;
      }
    }
    
    console.error('Could not initialize any Gemini model');
    model = null;
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
    console.error('Error details:', error.message);
    model = null;
  }
}

// Initialize on module load (will be re-initialized in server.js after dotenv loads)
// This is just a safety initialization
initializeGemini();

// Export initializeGemini so it can be called after dotenv loads
export { initializeGemini };

// Default workflow templates
const defaultWorkflows = {
  empty: {
    name: 'Empty Workflow',
    nodes: [],
    connections: {},
    active: false,
    settings: {},
    staticData: null,
    tags: []
  },
  email: {
    name: 'Email Notification',
    nodes: [
      {
        id: generateNodeId(),
        name: 'Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      },
      {
        id: generateNodeId(),
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          to: 'recipient@example.com',
          subject: 'Notification',
          text: 'This is an automated email.'
        }
      }
    ],
    connections: {
      Trigger: {
        main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
      }
    },
    active: false,
    settings: {},
    staticData: null,
    tags: []
  }
};

// Generate workflow and explanation using Gemini
async function generateWorkflowWithGemini(description) {
  // Re-initialize if model is null (in case env vars were updated)
  if (!model) {
    console.log('Model is null, attempting to re-initialize...');
    initializeGemini();
  }
  
  if (!model) {
    throw new Error('Gemini API not initialized. Please check your GEMINI_API_KEY.');
  }

  const prompt = `You are an expert at creating n8n workflow JSON configurations. Generate a complete, valid n8n workflow JSON based on this description: "${description}"

CRITICAL REQUIREMENTS FOR CONNECTIONS:
1. The connections object MUST use the EXACT node names (case-sensitive) as they appear in the nodes array
2. Every node (except the last one) MUST connect to the next node in sequence
3. Connections must be in this exact format: { "Source Node Name": { "main": [[{ "node": "Target Node Name", "type": "main", "index": 0 }]] } }
4. For multi-step workflows, each node connects to the next: Node1 -> Node2 -> Node3, etc.
5. ALL nodes must be connected in a linear chain - no disconnected nodes

Requirements:
1. Return ONLY valid JSON, no markdown formatting or code blocks
2. Include all required fields: name, nodes, connections, active, settings, staticData, tags
3. Each node must have: id (unique string), name, type, typeVersion, position [x, y], parameters
4. Use valid n8n node types (e.g., n8n-nodes-base.webhook, n8n-nodes-base.httpRequest, n8n-nodes-base.set, n8n-nodes-base.emailSend, etc.)
5. Generate unique node IDs (use UUID-like strings)
6. Position nodes in a logical flow (left to right): first node at [250, 300], second at [450, 300], third at [650, 300], etc.
7. Make the workflow practical and functional

Example with proper connections (3 nodes):
{
  "name": "Email Workflow",
  "nodes": [
    {
      "id": "node-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {}
    },
    {
      "id": "node-2",
      "name": "Set Data",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3,
      "position": [450, 300],
      "parameters": {}
    },
    {
      "id": "node-3",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 300],
      "parameters": {}
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Set Data", "type": "main", "index": 0}]]
    },
    "Set Data": {
      "main": [[{"node": "Send Email", "type": "main", "index": 0}]]
    }
  },
  "active": false,
  "settings": {},
  "staticData": null,
  "tags": []
}

IMPORTANT: Ensure EVERY node name in the connections object EXACTLY matches the node names in the nodes array. Generate the workflow JSON now:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }
    
    const workflow = JSON.parse(text);
    
    // Ensure all nodes have unique IDs
    workflow.nodes = workflow.nodes.map(node => ({
      ...node,
      id: node.id || generateNodeId()
    }));
    
    // Fix connections to ensure proper node linking
    workflow.connections = fixWorkflowConnections(workflow.nodes, workflow.connections || {});
    
    // Validate the workflow
    if (!validateWorkflow(workflow)) {
      throw new Error('Generated workflow failed validation');
    }
    
    // Generate explanation in the same call
    const explanationPrompt = `Based on this n8n workflow JSON, provide a clear, concise explanation of:
1. What this workflow does
2. How it works step-by-step
3. What each node does
4. How data flows through the workflow

Workflow: ${JSON.stringify(workflow, null, 2)}

Provide a well-structured explanation that a user can easily understand:`;
    
    try {
      const explanationResult = await model.generateContent(explanationPrompt);
      const explanationResponse = explanationResult.response;
      const explanation = explanationResponse.text();
      
      return { workflow, explanation };
    } catch (error) {
      console.error('Error generating explanation:', error);
      // Return workflow even if explanation fails
      return { workflow, explanation: 'Explanation generation failed. Please review the workflow JSON to understand how it works.' };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate workflow: ${error.message}`);
  }
}

// POST /api/workflows/generate
router.post('/generate', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || description.trim() === '') {
      // Return a default empty workflow
      return res.json({
        success: true,
        workflow: defaultWorkflows.empty,
        message: 'Empty description provided, returning default workflow'
      });
    }

    const { workflow, explanation } = await generateWorkflowWithGemini(description.trim());
    
    res.json({
      success: true,
      workflow,
      explanation,
      message: 'Workflow generated successfully'
    });
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate workflow'
    });
  }
});

// POST /api/workflows/save
router.post('/save', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not connected. Please configure MONGODB_URI in your .env file'
      });
    }

    const { description, workflow } = req.body;
    
    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow data is required'
      });
    }

    const savedWorkflow = new Workflow({
      description: description || 'Untitled workflow',
      workflow
    });

    await savedWorkflow.save();
    
    res.json({
      success: true,
      workflow: savedWorkflow,
      message: 'Workflow saved successfully'
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save workflow'
    });
  }
});

// GET /api/workflows
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        workflows: [],
        message: 'MongoDB is not connected. Workflows cannot be saved or retrieved.'
      });
    }

    const workflows = await Workflow.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch workflows'
    });
  }
});

// GET /api/workflows/:id
router.get('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not connected. Please configure MONGODB_URI in your .env file'
      });
    }

    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch workflow'
    });
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not connected. Please configure MONGODB_URI in your .env file'
      });
    }

    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete workflow'
    });
  }
});

// POST /api/workflows/chat - Chat endpoint for asking questions about workflows
router.post('/chat', async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API not initialized. Please check your GEMINI_API_KEY.'
      });
    }

    const { question, workflow } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow context is required'
      });
    }

    const chatPrompt = `You are an expert n8n workflow assistant. A user is asking a question about their workflow.

User's Question: "${question}"

Workflow JSON:
${JSON.stringify(workflow, null, 2)}

Please provide a helpful, clear, and concise answer to the user's question. If the question is about how the workflow works, explain it step by step. If it's about modifying the workflow, provide specific guidance.`;

    const result = await model.generateContent(chatPrompt);
    const response = result.response;
    const answer = response.text();
    
    res.json({
      success: true,
      answer,
      question
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process question'
    });
  }
});

export default router;

