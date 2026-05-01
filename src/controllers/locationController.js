import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';

export const submitPing = async (req, res, next) => {
  try {
    const { deviceId, longitude, latitude, speed = 0, heading = 0, province, district } = req.body;

    const vehicle = await Vehicle.findOne({ deviceId });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Device not registered' });

    const ping = await LocationPing.create({
      vehicle:  vehicle._id,
      location: { type: 'Point', coordinates: [+longitude, +latitude] },
      speed: +speed, heading: +heading, province, district
    });

    await Vehicle.findByIdAndUpdate(vehicle._id, {
      'currentLocation.coordinates': [+longitude, +latitude],
      'currentLocation.lastPingAt':  new Date()
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json({ success: true, data: ping });
  } catch (err) { next(err); }
};

export const getLocationHistory = async (req, res, next) => {
  try {
    const {
      vehicleId, from, to, province, district,
      sort = 'timestamp', order = 'desc',
      page = 1, limit = 100
    } = req.query;

    const filter = {};
    if (vehicleId) filter.vehicle  = vehicleId;
    if (province)  filter.province = province;
    if (district)  filter.district = district;

    // Scope: station_officer only sees their district
    if (req.user.role === 'station_officer' && req.user.district) {
      filter.district = req.user.district;
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }

    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const pings = await LocationPing.find(filter)
      .populate('vehicle', 'registrationNumber')
      .sort(sortObj)
      .limit(+limit)
      .skip((+page - 1) * +limit);

    const total = await LocationPing.countDocuments(filter);

    res.setHeader('X-Total-Count', total);
    res.setHeader('Cache-Control', 'private, max-age=60');

    res.json({ success: true, count: pings.length, total, page: +page, data: pings });
  } catch (err) { next(err); }
};

export const getLiveLocations = async (req, res, next) => {
  try {
    const { district, province } = req.query;
    const filter = { status: 'active' };

    if (district) filter.homeDistrict = district;

    // Scope: station_officer only sees their district
    if (req.user.role === 'station_officer' && req.user.district) {
      filter.homeDistrict = req.user.district;
    }

    const vehicles = await Vehicle.find(filter)
      .select('registrationNumber currentLocation homeDistrict')
      .populate('homeDistrict', 'name province')
      .sort({ 'currentLocation.lastPingAt': -1 });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Total-Count', vehicles.length);

    // Filter by province after populate
    let result = vehicles;
    if (province) {
      result = vehicles.filter(v =>
        v.homeDistrict?.province?.toString() === province
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (err) { next(err); }
};