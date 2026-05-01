import Driver from '../models/Driver.js';

export const getDrivers = async (req, res, next) => {
  try {
    const { isActive, search, sort = 'fullName', order = 'asc', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.fullName = { $regex: search, $options: 'i' };

    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const drivers = await Driver.find(filter)
      .sort(sortObj)
      .limit(+limit)
      .skip((+page - 1) * +limit);

    const total = await Driver.countDocuments(filter);

    // Conditional GET — ETag support
    const etag = `"drivers-${total}-${page}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('X-Total-Count', total);
    res.setHeader('Cache-Control', 'private, max-age=30');

    res.json({ success: true, count: drivers.length, total, page: +page, data: drivers });
  } catch (err) { next(err); }
};

export const getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

export const createDriver = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

export const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, message: 'Driver removed' });
  } catch (err) { next(err); }
};