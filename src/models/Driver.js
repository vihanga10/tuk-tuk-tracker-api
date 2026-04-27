import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  fullName:      { type: String, required: true },
  nic:           { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  phone:         { type: String },
  address:       { type: String }
}, { timestamps: true });

export default mongoose.model('Driver', DriverSchema);