'use client';

import { Home, FileText, File, Layers, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/',
    section: 'general',
  },
  {
    title: 'Invoice',
    icon: FileText,
    href: '/invoice',
    section: 'general',
  },
  {
    title: 'Other files',
    icon: File,
    href: '/other-files',
    section: 'general',
  },
  {
    title: 'Departments',
    icon: Layers,
    href: '/departments',
    section: 'general',
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users',
    section: 'general',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    section: 'general',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0050AA] rounded-xl flex items-center justify-center">
            <div className="w-10 h-10 bg-[#FFD500] rounded-lg flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2L2 7L12 12L22 7L12 2Z" 
                  fill="#0050AA"
                />
                <path 
                  d="M2 17L12 22L22 17V7L12 12L2 7V17Z" 
                  fill="#0050AA"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Buchhaltung</h2>
            <p className="text-xs text-gray-500">12 members</p>
          </div>
          <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            General
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#E8EBF0] text-[#0A1E42]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-[#0A1E42]' : 'text-gray-400'
                )} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - Flowbit AI */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#6366F1"/>
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#818CF8"/>
          </svg>
          <span className="text-sm font-semibold text-gray-900">Flowbit AI</span>
        </div>
      </div>
    </aside>
  );
}
