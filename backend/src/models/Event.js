import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    images: { type: [String], default: [] },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
