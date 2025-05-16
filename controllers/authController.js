import User from "../models/User.js";

export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check for existing username or email
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      message: "User created",
      userId: user._id,
      username: user.username,
      observations: user.observations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find by username or email
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(user);
    res.json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      observations: user.observations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
