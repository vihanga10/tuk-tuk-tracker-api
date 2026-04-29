import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['hq_admin', 'provincial_admin', 'station_officer', 'device'],
    required: true
  },
  province:      { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
  district:      { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  policeStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', UserSchema);