import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-sky-400 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The requested financial resource or endpoint could not be located in the MarketPulse platform.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-950"
      >
        Return to MarketPulse Intelligence
      </Link>
    </div>
  );
}
