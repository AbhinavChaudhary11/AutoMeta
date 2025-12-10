# 🤖 Autometa - AI-Powered n8n Workflow Generator

Autometa is a fully functional MERN stack web application that allows users to generate n8n workflow JSON files using natural language descriptions. The app uses Google's Gemini AI to intelligently create complete, ready-to-use n8n workflows.

## Features

- ✨ **AI-Powered Generation**: Describe your workflow in plain English and get a complete n8n workflow JSON
- 🎤 **Voice Input**: Use your browser's Web Speech API to speak your workflow description
- 📝 **Text Input**: Type your workflow description manually
- 📋 **Copy to Clipboard**: Easily copy generated workflow JSON
- 💾 **Save Workflows**: Store generated workflows in MongoDB for later use
- 📜 **Workflow History**: View and manage previously generated workflows
- 🎨 **Pre-built Templates**: Start with common workflow templates (Email, Slack, Google Sheets, etc.)
- ✏️ **Edit Workflows**: Modify generated workflows before downloading
- ⬇️ **Download JSON**: Export workflows as `.json` files ready for n8n import

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Web Speech API** - Voice input

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database (MongoDB Atlas free tier)
- **Google Gemini AI** - Workflow generation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier) or local MongoDB instance
- Google Gemini API key (free tier available)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Autometa
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```bash
cp env.example .env
```

4. Edit the `.env` file and add your configuration:
```env
# Required: Get your free API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: MongoDB connection string
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/autometa
# For local MongoDB: mongodb://localhost:27017/autometa
MONGODB_URI=

# Optional: Server port (defaults to 5000)
PORT=5000
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`


## Usage

1. **Generate a Workflow**:
   - Navigate to the "Generate Workflow" tab
   - Type or speak your workflow description (e.g., "Send an email when a webhook is triggered")
   - Click "Generate Workflow"
   - Review, edit if needed, and download or save

2. **Use Templates**:
   - Go to the "Templates" tab
   - Select a pre-built template
   - Click "Use Template" to load it in the generator
   - Customize as needed

3. **View History**:
   - Check the "History" tab to see saved workflows
   - Download or copy any previously saved workflow

## Project Structure

```
Autometa/
├── backend/
│   ├── models/
│   │   └── Workflow.js          # MongoDB schema
│   ├── routes/
│   │   └── workflows.js         # API routes
│   ├── utils/
│   │   └── workflowUtils.js     # Helper functions
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowGenerator.jsx
│   │   │   ├── WorkflowEditor.jsx
│   │   │   ├── WorkflowPreview.jsx
│   │   │   ├── WorkflowTemplates.jsx
│   │   │   ├── WorkflowHistory.jsx
│   │   │   └── VoiceInput.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses --watch flag for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```


