import mongoose from 'mongoose';

const LocationPingSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  speed:     { type: Number, default: 0 },
  heading:   { type: Number, default: 0 },
  province:  { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
  district:  { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

LocationPingSchema.index({ location: '2dsphere' });
LocationPingSchema.index({ vehicle: 1, timestamp: -1 });
LocationPingSchema.index({ district: 1, timestamp: -1 });
LocationPingSchema.index({ province: 1, timestamp: -1 });

export default mongoose.model('LocationPing', LocationPingSchema);