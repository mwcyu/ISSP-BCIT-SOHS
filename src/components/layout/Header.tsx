import { Menu } from 'lucide-react';
import bcitLogo from '../assets/bcit-logo.png'; //

interface HeaderProps {
  onMenuClick: () => void;
  onProgressClick: () => void;
  onSettingsClick: () => void;
}

export function Header({ onMenuClick, onProgressClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bcit-blue text-white h-16 flex items-center px-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {/* ✅ Circle container for logo */}
          <div className="bg-bcit-gold p-1 rounded-full flex items-center justify-center w-10 h-10 overflow-hidden">
            <img
              src={bcitLogo}
              alt="BCIT Logo"
              className="w-8 h-8 object-cover rounded-full"
            />
          </div>
          <h1 className="text-xl text-bcit-gold font-bold">Clinical Feedback Helper</h1>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={onProgressClick}
          className="text-bcit-gold hover:text-white hover:bg-white/10 rounded-md px-3 py-1 transition-all duration-200 text-lg font-bold"
        >
          Progress
        </button>

      </div>
    </header>
  );
}
