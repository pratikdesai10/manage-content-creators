import { useAuth } from '../../hooks/useAuth';

export function AgencyDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.email}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO: stats cards (creator searches, active deals, team members) */}
        {['Creator Searches', 'Active Deals', 'Team Members'].map((label) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
