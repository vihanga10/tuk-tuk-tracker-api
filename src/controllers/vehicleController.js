import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res, next) => {
  try {
    const { district, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (district) filter.homeDistrict = district;
    if (status)   filter.status = status;
    const vehicles = await Vehicle.find(filter)
      .populate('driver', 'fullName nic phone')
      .populate('homeDistrict', 'name')
      .limit(+limit).skip((+page - 1) * +limit);
    const total = await Vehicle.countDocuments(filter);
    res.json({ success: true, count: vehicles.length, total, data: vehicles });
  } catch (err) { next(err); }
};

export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driver').populate('homeDistrict', 'name');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (err) { next(err); }
};

export const getCurrentLocation = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .select('registrationNumber currentLocation');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};