import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    channel: { type: String, enum: ["sms", "whatsapp", "both"], default: "sms" },
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
