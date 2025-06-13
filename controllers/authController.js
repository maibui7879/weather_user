const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { fullname, username, password, address } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Tài khoản đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname, username, password: hashed, address
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ token, user: userData });
    } catch (err) {
      console.error("Tên lỗi gì đó:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Sai tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProfile = async (req, res) => {
  const { fullname, address } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullname, address },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};
