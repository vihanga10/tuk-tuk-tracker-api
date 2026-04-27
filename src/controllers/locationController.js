import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';

export const submitPing = async (req, res, next) => {
  try {
    const { deviceId, longitude, latitude, speed = 0, heading = 0, province, district } = req.body;
    const vehicle = await Vehicle.findOne({ deviceId });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Device not registered' });

    const ping = await LocationPing.create({
      vehicle:  vehicle._id,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      speed, heading, province, district
    });

    await Vehicle.findByIdAndUpdate(vehicle._id, {
      'currentLocation.coordinates': [longitude, latitude],
      'currentLocation.lastPingAt':  new Date()
    });

    res.status(201).json({ success: true, data: ping });
  } catch (err) { next(err); }
};

export const getLocationHistory = async (req, res, next) => {
  try {
    const { vehicleId, from, to, province, district, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicle  = vehicleId;
    if (province)  filter.province = province;
    if (district)  filter.district = district;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }
    const pings = await LocationPing.find(filter)
      .populate('vehicle', 'registrationNumber')
      .sort({ timestamp: -1 })
      .limit(+limit).skip((+page - 1) * +limit);
    const total = await LocationPing.countDocuments(filter);
    res.json({ success: true, count: pings.length, total, data: pings });
  } catch (err) { next(err); }
};

export const getLiveLocations = async (req, res, next) => {
  try {
    const { district } = req.query;
    const filter = { status: 'active' };
    if (district) filter.homeDistrict = district;
    const vehicles = await Vehicle.find(filter)
      .select('registrationNumber currentLocation homeDistrict')
      .populate('homeDistrict', 'name');
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) { next(err); }
};