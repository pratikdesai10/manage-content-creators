import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h1 className="text-8xl font-extrabold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition"
      >
        Go home
      </Link>
    </div>
  );
}
