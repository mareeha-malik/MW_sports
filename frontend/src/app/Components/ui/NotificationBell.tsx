'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative text-gray-400 hover:text-BrightOrange transition-colors duration-300 hover:scale-110 transform p-0"
      title="Notifications"
    >
      <Bell className="w-6 h-6 stroke-2" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-BrightOrange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
