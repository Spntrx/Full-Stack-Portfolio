import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  completionDate: { type: Date, required: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);