import { Router } from "express";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const events = await Event.aggregate([
    { $match: { startAt: { $gte: new Date() } } },
    { $sort: { startAt: 1 } },
    {
      $lookup: {
        from: "registrations",
        localField: "_id",
        foreignField: "eventId",
        as: "registrations",
      },
    },
    {
      $addFields: {
        registrationsCount: { $size: "$registrations" },
      },
    },
    { $project: { registrations: 0 } },
  ]);
  return res.json({ events });
});

router.post("/register", requireAuth, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ message: "eventId is required." });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const registrationCount = await Registration.countDocuments({ eventId });
  if (registrationCount >= event.capacity) {
    return res.status(400).json({ message: "Event is full." });
  }

  try {
    await Registration.create({ userId: req.user.sub, eventId });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Already registered." });
    }
    throw error;
  }

  const registrationsCount = await Registration.countDocuments({ eventId });

  return res.json({ success: true, registrationsCount });
});

export default router;
