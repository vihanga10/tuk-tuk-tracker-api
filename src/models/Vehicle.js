import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  driver:       { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  deviceId:     { type: String, required: true, unique: true },
  status:       { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  homeDistrict: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  currentLocation: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    lastPingAt:  { type: Date }
  }
}, { timestamps: true });

VehicleSchema.index({ 'currentLocation': '2dsphere' });

export default mongoose.model('Vehicle', VehicleSchema);