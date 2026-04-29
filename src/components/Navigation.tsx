import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Settings as SettingsIcon, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
};

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/add', label: 'Add Game', icon: PlusCircle },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-indigo-950/80 backdrop-blur-md border-t border-indigo-800 z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="flex-1">
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors duration-200",
                    isActive 
                      ? "text-fuchsia-400"
                      : "text-indigo-200 hover:text-white"
                  )}
                >
                  <Icon size={24} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden sm:block sticky top-0 w-full bg-indigo-950/80 backdrop-blur-md shadow-lg border-b border-indigo-800 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "border-fuchsia-400 text-fuchsia-400"
                        : "border-transparent text-indigo-200 hover:border-indigo-400 hover:text-white"
                    )}
                  >
                    <Icon className="mr-2" size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
