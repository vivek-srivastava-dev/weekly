import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { EmailOtp } from "../models/EmailOtp.js";
import { User } from "../models/User.js";
import { generateOtp } from "../utils/otp.js";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";

const router = Router();

router.post("/request-email-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid email is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

  await EmailOtp.deleteMany({ email: normalizedEmail });
  await EmailOtp.create({ email: normalizedEmail, code, expiresAt });

  await sendEmailOtp({ email: normalizedEmail, code });

  return res.json({ success: true, expiresInMinutes: env.OTP_TTL_MINUTES });
});

router.post("/verify-email-otp", async (req, res) => {
  const { email, code, name, phoneNumber } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid email is required." });
  }

  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "OTP code is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = await EmailOtp.findOne({ email: normalizedEmail, code });
  if (!otp || otp.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const normalizedPhone =
    typeof phoneNumber === "string" && phoneNumber.trim()
      ? phoneNumber.trim()
      : undefined;

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    try {
      user = await User.create({
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        name: typeof name === "string" ? name.trim() : "",
        verifiedAt: new Date(),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          message:
            "This phone number is already linked to another user. Please use a different number.",
        });
      }
      throw error;
    }
  } else {
    user.verifiedAt = new Date();
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    if (normalizedPhone) {
      user.phoneNumber = normalizedPhone;
    }
    try {
      await user.save();
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          message:
            "This phone number is already linked to another user. Please use a different number.",
        });
      }
      throw error;
    }
  }

  await EmailOtp.deleteMany({ email: normalizedEmail });

  const token = jwt.sign(
    { sub: user.id, email: user.email, phoneNumber: user.phoneNumber },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
    },
  });
});

export default router;
