import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  workflow: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Workflow', workflowSchema);

