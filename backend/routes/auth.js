//backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/validate-pin", (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ message: "PIN is required" });
    }

    // Validate PIN
    if (pin !== process.env.PIN_CODE) {
        return res.status(401).json({
            message: "Invalid PIN"
        });
    }

    // Generate token
    const token = jwt.sign(
        { authorized: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

export default router;