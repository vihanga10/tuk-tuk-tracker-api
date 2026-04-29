import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const register = async (req, res, next) => {
  try {
    const { username, password, role, province, district, policeStation } = req.body;
    const user = await User.create({ username, password, role, province, district, policeStation });
    const token = signToken(user._id);
    res.status(201).json({
      success: true, token,
      data: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({
      success: true, token,
      data: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) { next(err); }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// GET all users — hq_admin only
export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role)     filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .populate('province', 'name')
      .populate('district', 'name')
      .populate('policeStation', 'name');

    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// PUT /auth/users/:id — activate/deactivate or change role
export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['isActive', 'role', 'province', 'district', 'policeStation'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};