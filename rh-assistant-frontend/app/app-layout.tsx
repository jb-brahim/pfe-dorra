'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mail, Users, Briefcase, Calendar, BarChart3, Settings, LogOut, Menu, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await api.get('/emails');
        setUnreadCount(data.filter((e: any) => !e.isRead).length);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // If on the login page, render children without the sidebar
  const isLoginPage = pathname === '/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show nothing while checking auth
  if (loading) return null;

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/mails', label: 'My Mails', icon: Mail, badge: unreadCount > 0 ? unreadCount.toString() : null },
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/jobs', label: 'Job Board', icon: Briefcase },
    { href: '/interviews', label: 'Interviews', icon: Calendar },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const bottomItems = [
    { href: '/email-templates', label: 'Email Templates', icon: Mail },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/20 dark:border-white/10 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col backdrop-blur-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">RH</span>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground">RH Assistant</h1>
            <p className="text-xs text-muted-foreground">Smart HR Platform</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 rounded-xl px-4 py-5 transition-all duration-300",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105"
                      : "text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="border-t border-white/10 dark:border-white/5 p-3 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 rounded-xl px-4 py-4 text-sm transition-all duration-300",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/40"
                      : "text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Upgrade Card */}
        <div className="p-3 border-t border-white/10 dark:border-white/5">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-center text-white shadow-lg shadow-blue-500/30">
            <Crown className="w-6 h-6 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
            <p className="text-xs opacity-90 mb-3">Unlock advanced features and boost your recruitment.</p>
            <Link href="/upgrade" className="block w-full">
              <Button 
                size="sm" 
                className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-500/50 text-white font-black text-sm shrink-0">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border h-16 flex items-center justify-between px-4">
        <h2 className="font-semibold text-foreground">RH Assistant</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden h-16" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
