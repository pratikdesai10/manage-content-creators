import { useLocation } from 'react-router-dom';

export function Footer() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <footer className={isLanding
      ? 'bg-[#050510] border-t border-white/10 mt-auto'
      : 'bg-white border-t border-gray-200 mt-auto'
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className={`text-center text-sm ${isLanding ? 'text-gray-500' : 'text-gray-500'}`}>
          &copy; {new Date().getFullYear()} CollabHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
