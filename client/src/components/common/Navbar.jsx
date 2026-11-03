import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Bell,
  Sun,
  Moon,
  LogOut,
  CheckCheck,
  User as UserIcon,
  Calendar,
  FileText,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'ADMIN':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
      case 'PATIENT':
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      case 'PRESCRIPTION':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'PROGRESS':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const profilePath =
    user?.role === 'PATIENT'
      ? '/patient/profile'
      : user?.role === 'DOCTOR'
      ? '/doctor/profile'
      : '/admin/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone: Logo + Tagline */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-700/10 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                MEDIVAULT
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider font-semibold text-teal-700 dark:text-teal-400 block -mt-1 uppercase">
              CLINICAL MERN SYSTEM
            </span>
          </div>
        </Link>

        {/* User & Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Role Badge Pill */}
          {user && (
            <span
              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-semibold border rounded-full ${getRoleBadgeClasses(
                user.role
              )}`}
            >
              {user.role}
            </span>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open clinical notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold text-white bg-rose-600 rounded-full border-2 border-white dark:border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-950/10 z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        Clinical Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications currently on file.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.isRead && markAsRead(notif._id)}
                          className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3 ${
                            !notif.isRead
                              ? 'bg-teal-50/40 dark:bg-teal-950/20'
                              : 'opacity-75'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Details in Monospace + Avatar */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200 dark:border-slate-800">
              <Link
                to={profilePath}
                className="hidden md:flex flex-col text-right hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                  {user.email}
                </span>
              </Link>

              <Link
                to={profilePath}
                className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-teal-600 transition-all"
                title="View Profile"
              >
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
              </Link>

              {/* Logout Icon */}
              <button
                onClick={logout}
                aria-label="Sign out of MEDIVAULT"
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
