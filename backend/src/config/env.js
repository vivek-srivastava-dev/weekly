import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/weekly",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
