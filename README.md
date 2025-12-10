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

### 4. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### 5. MongoDB Setup (Optional)

If you want to save workflows:

**Option A: MongoDB Atlas (Free Tier)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string and add it to `.env`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/autometa`

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

## API Endpoints

### `POST /api/workflows/generate`
Generate a workflow from a description.

**Request Body:**
```json
{
  "description": "Send an email notification when triggered"
}
```

**Response:**
```json
{
  "success": true,
  "workflow": { /* n8n workflow JSON */ },
  "message": "Workflow generated successfully"
}
```

### `POST /api/workflows/save`
Save a workflow to the database.

**Request Body:**
```json
{
  "description": "Email notification workflow",
  "workflow": { /* n8n workflow JSON */ }
}
```

### `GET /api/workflows`
Get all saved workflows.

### `GET /api/workflows/:id`
Get a specific workflow by ID.

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

## Troubleshooting

### Backend Issues

1. **"GEMINI_API_KEY not found"**
   - Make sure you've created a `.env` file in the `backend` directory
   - Verify your API key is correct

2. **MongoDB Connection Error**
   - Check your MongoDB connection string
   - Ensure MongoDB is running (if using local instance)
   - Verify network access (if using Atlas)

3. **Port Already in Use**
   - Change the `PORT` in `.env` to a different port
   - Or stop the process using port 5000

### Frontend Issues

1. **Cannot Connect to Backend**
   - Ensure the backend server is running on port 5000
   - Check the proxy configuration in `vite.config.js`

2. **Voice Input Not Working**
   - Voice input requires Chrome or Edge browser
   - Ensure microphone permissions are granted

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using React, Express, MongoDB, and Google Gemini AI

