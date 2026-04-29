import Province from '../models/Province.js';

export const getProvinces = async (req, res, next) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });
    res.json({ success: true, count: provinces.length, data: provinces });
  } catch (err) { next(err); }
};

export const getProvince = async (req, res, next) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) return res.status(404).json({ success: false, message: 'Province not found' });
    res.json({ success: true, data: province });
  } catch (err) { next(err); }
};

export const createProvince = async (req, res, next) => {
  try {
    const province = await Province.create(req.body);
    res.status(201).json({ success: true, data: province });
  } catch (err) { next(err); }
};

export const updateProvince = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!province) return res.status(404).json({ success: false, message: 'Province not found' });
    res.json({ success: true, data: province });
  } catch (err) { next(err); }
};

export const deleteProvince = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndDelete(req.params.id);
    if (!province) return res.status(404).json({ success: false, message: 'Province not found' });
    res.json({ success: true, message: 'Province deleted' });
  } catch (err) { next(err); }
};