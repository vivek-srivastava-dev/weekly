import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Otp } from "../models/Otp.js";
import { User } from "../models/User.js";
import { generateOtp } from "../utils/otp.js";
import { sendOtp } from "../utils/sendOtp.js";

const router = Router();

router.post("/request-otp", async (req, res) => {
  const { phoneNumber, channel = "sms" } = req.body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return res.status(400).json({ message: "Valid phone number is required." });
  }

  if (!["sms", "whatsapp", "both"].includes(channel)) {
    return res.status(400).json({ message: "Invalid delivery channel." });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

  await Otp.deleteMany({ phoneNumber });
  await Otp.create({ phoneNumber, code, expiresAt, channel });

  await sendOtp({ phoneNumber, code, channel });

  return res.json({ success: true, expiresInMinutes: env.OTP_TTL_MINUTES });
});

router.post("/verify-otp", async (req, res) => {
  const { phoneNumber, code, name } = req.body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return res.status(400).json({ message: "Valid phone number is required." });
  }

  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "OTP code is required." });
  }

  const otp = await Otp.findOne({ phoneNumber, code });
  if (!otp || otp.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({
      phoneNumber,
      name: typeof name === "string" ? name.trim() : "",
      verifiedAt: new Date(),
    });
  } else {
    user.verifiedAt = new Date();
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    await user.save();
  }

  await Otp.deleteMany({ phoneNumber });

  const token = jwt.sign(
    { sub: user.id, phoneNumber: user.phoneNumber },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: { id: user.id, phoneNumber: user.phoneNumber, name: user.name },
  });
});

export default router;
