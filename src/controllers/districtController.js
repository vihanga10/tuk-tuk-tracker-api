import District from '../models/District.js';

export const getDistricts = async (req, res, next) => {
  try {
    const { province } = req.query;
    const filter = province ? { province } : {};
    const districts = await District.find(filter).populate('province', 'name').sort({ name: 1 });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) { next(err); }
};

export const getDistrict = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id).populate('province', 'name');
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: district });
  } catch (err) { next(err); }
};

export const createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, data: district });
  } catch (err) { next(err); }
};

export const updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: district });
  } catch (err) { next(err); }
};

export const deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, message: 'District deleted' });
  } catch (err) { next(err); }
};