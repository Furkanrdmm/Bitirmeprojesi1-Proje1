const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const { generateToken } = require("../middleware/auth.js");

// İstemciye dönecek kullanıcı bilgisi (şifre hash'i hariç)
const toAuthResponse = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  role: user.role,
  avatar: user.avatar,
  token: generateToken(user),
});

const generateRandomAvatar = () => {
  const randomAvatar = Math.floor(Math.random() * 71);
  return `https://i.pravatar.cc/300?img=${randomAvatar}`;
};

// Kullanıcı Oluşturma (Create - Register)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const defaultAvatar = generateRandomAvatar();

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email address is already registed." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await new User({
      username,
      email,
      password: hashedPassword,
      avatar: defaultAvatar,
    });

    await newUser.save();

    res.status(201).json(toAuthResponse(newUser));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Kullanıcı girişi (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    // E-posta mı şifre mi yanlış, saldırgana belli etmemek için tek mesaj
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json(toAuthResponse(user));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
