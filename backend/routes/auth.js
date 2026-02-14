
//backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

let attempts = 0;
let lockUntil = null;

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

router.post("/validate-pin", (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ message: "PIN is required" });
    }

    // Check if user is locked out
    if (lockUntil && Date.now() < lockUntil) {
        const secondsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
        return res.status(429).json({
            message: `Too many attempts. Try again in ${secondsLeft}s`,
            waitSeconds: secondsLeft
        });
    }

    // Validate PIN
    if (pin !== process.env.PIN_CODE) {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            lockUntil = Date.now() + LOCKOUT_TIME;
            attempts = 0;
        }
        return res.status(401).json({
            message: "Invalid PIN",
            attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts)
        });
    }

    // Reset on success
    attempts = 0;
    lockUntil = null;

    // Generate token
    const token = jwt.sign(
        { authorized: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

export default router;