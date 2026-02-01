import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Weekly - Redirect" },
    { name: "description", content: "Redirect to authentication." },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Weekly</h1>
        <p className="text-gray-600">
          Please sign in with your mobile number to continue.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
