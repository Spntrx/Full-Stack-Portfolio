import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, required: true, trim: true, maxlength: 100 },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 40,
    match: /^[+()0-9 .-]{7,40}$/
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxlength: 254
  },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);