import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  fullName:      { type: String, required: true, trim: true },
  nic:           { type: String, required: true, unique: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true, trim: true },
  phone:         { type: String, trim: true },
  address:       { type: String, trim: true },
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Driver', DriverSchema);