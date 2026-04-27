import PoliceStation from '../models/PoliceStation.js';

export const getStations = async (req, res, next) => {
  try {
    const { district, province } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (province) filter.province = province;
    const stations = await PoliceStation.find(filter)
      .populate('district', 'name')
      .populate('province', 'name');
    res.json({ success: true, count: stations.length, data: stations });
  } catch (err) { next(err); }
};

export const createStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (err) { next(err); }
};