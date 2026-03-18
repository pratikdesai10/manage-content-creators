import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DarkBackground } from './DarkBackground';

export function PageLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050510] text-white">
      <DarkBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
