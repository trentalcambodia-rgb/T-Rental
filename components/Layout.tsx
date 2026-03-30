import React from 'react';
import { UserRole } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const RENTER_TABS = [
  { id: 'home', label: 'Explore', icon: 'compass', path: '/' },
  { id: 'bookings', label: 'Trips', icon: 'calendar', path: '/bookings' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
];

const LENDER_TABS = [
  { id: 'dashboard', label: 'Stats', icon: 'bar-chart', path: '/' },
  { id: 'inventory', label: 'My Items', icon: 'box', path: '/inventory' },
  { id: 'requests', label: 'Requests', icon: 'bell', path: '/requests' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
];

const SHOP_TABS = [
  { id: 'dashboard', label: 'Manage', icon: 'grid', path: '/' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-full', path: '/calendar' },
  { id: 'inventory', label: 'Inventory', icon: 'box', path: '/inventory' },
  { id: 'profile', label: 'Shop Info', icon: 'profile', path: '/profile' },
];

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Admin', icon: 'shield', path: '/' },
  { id: 'users', label: 'Users', icon: 'users', path: '/users' },
  { id: 'disputes', label: 'Disputes', icon: 'alert', path: '/disputes' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
];

// Simple Icon implementation
const Icon = ({ name, active }: { name: string; active: boolean }) => {
  const colorClass = active ? "stroke-primary stroke-[2.5px]" : "stroke-gray-400 stroke-2";
  
  const paths: Record<string, React.ReactElement> = {
    compass: <circle cx="12" cy="12" r="10" />,
    map: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" strokeLinecap="round" strokeLinejoin="round"/>,
    calendar: <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />,
    user: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>,
    'bar-chart': <path d="M12 20V10m6 10V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>,
    box: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round"/>,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>,
    briefcase: <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>,
    grid: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round"/>,
    'calendar-full': <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>,
    alert: <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round"/>,
    profile: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
  };

  return (
    <svg className={`w-6 h-6 ${colorClass} transition-all duration-300`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {paths[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
}

export const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  let tabs = RENTER_TABS;
  if (role === UserRole.LENDER) tabs = LENDER_TABS;
  if (role === UserRole.SHOP) tabs = SHOP_TABS;
  if (role === UserRole.ADMIN) tabs = ADMIN_TABS;

  return (
    <div className="flex flex-col h-screen max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto bg-background border-x border-gray-200 relative shadow-2xl overflow-hidden font-sans transition-all duration-500">
      
      {/* Main Content - Flex-1 takes remaining space */}
      <main className="flex-1 overflow-y-auto no-scrollbar bg-background">
        {children}
      </main>

      {/* Solid Bottom Navigation */}
      <nav className="bg-surface border-t border-gray-200 pb-safe pt-2 px-2 shadow-nav z-50">
        <div className="flex justify-around items-end w-full pb-3">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center w-full group py-1"
              >
                <div className={`
                    p-1.5 rounded-full mb-1 transition-all duration-300 
                    ${isActive ? 'bg-indigo-50 transform -translate-y-1' : ''}
                `}>
                    <Icon name={tab.icon} active={isActive} />
                </div>
                <span className={`
                    text-[10px] font-semibold transition-colors duration-300
                    ${isActive ? 'text-primary' : 'text-gray-400'}
                `}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
