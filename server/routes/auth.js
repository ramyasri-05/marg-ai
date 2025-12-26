const router = require('express').Router();
const User = require('../models/User');

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role, name, vehicleId } = req.body;

        // Simple validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            email,
            password, // Storing plain text for Hackathon speed as requested implicitly by "email and password"
            role,
            name,
            vehicleId
        });

        const savedUser = await newUser.save();
        res.json({ message: "User created successfully", user: { id: savedUser._id, role: savedUser.role, name: savedUser.name } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error during Signup" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Return User Info
        res.json({
            message: "Login Successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                history: user.history // Return history for drivers
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error during Login" });
    }
});

module.exports = router;
