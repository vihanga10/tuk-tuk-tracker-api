import District from '../models/District.js';

export const getDistricts = async (req, res, next) => {
  try {
    const { province } = req.query;
    const filter = province ? { province } : {};
    const districts = await District.find(filter).populate('province', 'name').sort({ name: 1 });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) { next(err); }
};

export const createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, data: district });
  } catch (err) { next(err); }
};