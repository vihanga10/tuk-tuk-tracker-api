import Province from '../models/Province.js';

export const getProvinces = async (req, res, next) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });
    res.json({ success: true, count: provinces.length, data: provinces });
  } catch (err) { next(err); }
};

export const createProvince = async (req, res, next) => {
  try {
    const province = await Province.create(req.body);
    res.status(201).json({ success: true, data: province });
  } catch (err) { next(err); }
};

export const deleteProvince = async (req, res, next) => {
  try {
    await Province.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Province deleted' });
  } catch (err) { next(err); }
};