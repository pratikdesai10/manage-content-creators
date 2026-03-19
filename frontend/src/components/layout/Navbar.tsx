import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    navigate('/');
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.email?.[0]?.toUpperCase() ?? '?';
  const dashboardPath = user?.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/agency';
  const profilePath = user?.role === 'CREATOR' ? `/creators/${user?.id}` : `/agencies/${user?.id}`;

  return (
    <nav className="bg-[#050510]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? dashboardPath : '/'} className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CollabHub
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {!isAuthenticated && (
              <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">
                Home
              </Link>
            )}

            {isAuthenticated && user ? (
              <>
                <Link to="/creators" className="text-sm text-white/70 hover:text-white transition-colors">
                  Discover
                </Link>
                <Link to={dashboardPath} className="text-sm text-white/70 hover:text-white transition-colors">
                  Dashboard
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-purple-300 transition focus:outline-none"
                    aria-label="Account menu"
                  >
                    {initials}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{user.role?.toLowerCase()}</p>
                      </div>

                      <Link
                        to={dashboardPath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition"
                      >
                        <span className="text-base">📊</span> View Dashboard
                      </Link>

                      <Link
                        to={profilePath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition"
                      >
                        <span className="text-base">👤</span> View Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition"
                      >
                        <span className="text-base">&#9881;&#65039;</span> Settings
                      </Link>

                      <div className="border-t border-white/5 mt-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                      >
                        <span className="text-base">🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup/creator"
                  className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
