import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/events";
import { useNavigate } from "react-router";
import { apiFetch } from "../lib/api";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  startAt: string;
  endAt: string;
  capacity: number;
  registrationsCount: number;
};

type EventsResponse = {
  events: EventItem[];
};

type RegisterResponse = {
  success: boolean;
  registrationsCount: number;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Weekly - Events" },
    { name: "description", content: "Upcoming events." },
  ];
}

function EventCollage({
  images,
  title,
  location,
}: {
  images: string[];
  title: string;
  location: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex">
        {images.map((image, idx) => (
          <img
            key={`${title}-collage-${idx}`}
            src={image}
            alt={title}
            className="h-44 w-full shrink-0 object-cover"
          />
        ))}
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
        {location}
      </span>
    </div>
  );
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()} · ${startDate.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )} - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setToken(localStorage.getItem("weekly_token"));
    setPhoneNumber(localStorage.getItem("weekly_phone"));
    setName(localStorage.getItem("weekly_name"));
    setEmail(localStorage.getItem("weekly_email"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!token) {
      navigate("/");
      return;
    }

    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<EventsResponse>("/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [navigate, token, hydrated]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleRegister = async (eventId: string) => {
    if (!token) {
      navigate("/");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      const data = await apiFetch<RegisterResponse>("/events/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { eventId },
      });
      setNotice("Registration confirmed. See you there!");
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId
            ? { ...event, registrationsCount: data.registrationsCount }
            : event
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="relative z-50 flex flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                Weekly picks
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-gray-900">
                Upcoming Events
              </h1>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {(name || phoneNumber || email || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-gray-900">
                    {name || "Guest"}
                  </span>
                <span className="block text-xs text-gray-500">
                  {phoneNumber || email}
                </span>
                </span>
                <span className="text-gray-400">▾</span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl z-50">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                    Profile
                  </p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">
                    {name || "Guest"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {phoneNumber || email}
                  </p>
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("logging out");
                        localStorage.removeItem("weekly_token");
                        localStorage.removeItem("weekly_phone");
                        localStorage.removeItem("weekly_name");
                        localStorage.removeItem("weekly_email");
                        navigate("/");
                      }}
                      className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {notice ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow">
            No upcoming events found. Check back soon.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event._id}
                className="relative z-0 overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl flex flex-col gap-3"
              >
                {event.images?.[0] ? (
                  <EventCollage
                    images={event.images}
                    title={event.title}
                    location={event.location}
                  />
                ) : null}
                <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {formatDateRange(event.startAt, event.endAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <p>
                        Registered: {event.registrationsCount} /{" "}
                        {event.capacity}
                      </p>
                      <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${Math.min(
                              100,
                              (event.registrationsCount / event.capacity) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRegister(event._id)}
                      disabled={event.registrationsCount >= event.capacity}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {event.registrationsCount >= event.capacity
                        ? "Full"
                        : "Register"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
