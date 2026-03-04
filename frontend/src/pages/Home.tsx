import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
        Connect Creators with Agencies
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        CollabHub is the platform where content creators and talent agencies
        find each other, collaborate, and grow together.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/signup/creator"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
        >
          Join as Creator
        </Link>
        <Link
          to="/signup/agency"
          className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
        >
          Join as Agency
        </Link>
      </div>
    </div>
  );
}
