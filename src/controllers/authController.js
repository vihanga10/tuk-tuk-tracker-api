import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const register = async (req, res, next) => {
  try {
    const { username, password, role, province, district, policeStation } = req.body;
    const user = await User.create({ username, password, role, province, district, policeStation });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, data: { id: user._id, username: user.username, role: user.role } });
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
    res.json({ success: true, token, data: { id: user._id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};