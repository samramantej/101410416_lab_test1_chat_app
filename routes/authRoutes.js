const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        console.log("Signup Request Received:", req.body);

        const { username, firstname, lastname, password } = req.body;

        if (!username || !firstname || !lastname || !password) {
            console.log("Missing required fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, firstname, lastname, password: hashedPassword });

        await newUser.save();
        console.log("User registered successfully");
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        console.log("Login Request Received:", req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            console.log("Missing required fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log("Invalid username");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("Login successful");
        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
