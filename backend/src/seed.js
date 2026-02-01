import { connectToDatabase } from "./db/connect.js";
import { Event } from "./models/Event.js";

const now = new Date();

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function seed() {
  await connectToDatabase();

  const existing = await Event.countDocuments();
  if (existing > 0) {
    console.log("Events already exist. Skipping seed.");
    process.exit(0);
  }

  const events = [
    {
      title: "Sunrise Yoga",
      description: "Start your weekend with a calm outdoor yoga session.",
      location: "Central Park",
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
      ],
      startAt: addDays(now, 6),
      endAt: addHours(addDays(now, 6), 1.5),
      capacity: 25,
    },
    {
      title: "Weekend Food Walk",
      description: "Explore local street food spots with a guided group.",
      location: "Old Town",
      images: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      ],
      startAt: addDays(now, 7),
      endAt: addHours(addDays(now, 7), 2),
      capacity: 30,
    },
    {
      title: "Live Music Night",
      description: "Chill with indie artists and acoustic sets.",
      location: "Riverfront Stage",
      images: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
      ],
      startAt: addDays(now, 8),
      endAt: addHours(addDays(now, 8), 2.5),
      capacity: 80,
    },
  ];

  await Event.insertMany(events);
  console.log("Seeded events.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
