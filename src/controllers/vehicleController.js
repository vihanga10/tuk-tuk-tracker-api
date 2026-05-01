import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res, next) => {
  try {
    const {
      district, status, province,
      sort = 'createdAt', order = 'desc',
      page = 1, limit = 20
    } = req.query;

    const filter = {};
    if (district) filter.homeDistrict = district;
    if (province) filter['homeDistrict.province'] = province;
    if (status)   filter.status = status;

    // Scope: station_officer only sees their district
    if (req.user.role === 'station_officer' && req.user.district) {
      filter.homeDistrict = req.user.district;
    }

    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const vehicles = await Vehicle.find(filter)
      .populate('driver', 'fullName nic phone')
      .populate('homeDistrict', 'name')
      .sort(sortObj)
      .limit(+limit)
      .skip((+page - 1) * +limit);

    const total = await Vehicle.countDocuments(filter);

    const etag = `"vehicles-${total}-${page}-${sort}-${order}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('X-Total-Count', total);
    res.setHeader('Cache-Control', 'private, max-age=15');

    res.json({ success: true, count: vehicles.length, total, page: +page, data: vehicles });
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

    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};