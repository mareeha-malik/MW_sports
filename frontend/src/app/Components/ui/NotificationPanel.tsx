'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  relatedOrderId?: number;
  icon?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'order_shipped':
        return 'bg-purple-500/10 border-purple-500/30';
      case 'order_delivered':
        return 'bg-green-500/10 border-green-500/30';
      case 'order_cancelled':
        return 'bg-red-500/10 border-red-500/30';
      case 'payment_received':
        return 'bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-96 dark:bg-gradient-to-br dark:from-BgWalaBlack dark:via-HeaderWalaBlack dark:to-BgWalaBlack light:bg-white dark:shadow-2xl light:shadow-xl flex flex-col dark:border-l dark:border-gray-700 light:border-l light:border-[#E5E7EB]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 dark:border-b dark:border-gray-700 light:border-b light:border-[#E5E7EB]">
          <h2 className="text-xl font-bold dark:text-white light:text-[#1F2937] flex items-center gap-2">
            <Bell className="w-6 h-6 text-BrightOrange" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-BrightOrange text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="dark:text-gray-400 light:text-[#6B7280] hover:text-BrightOrange text-2xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 dark:border-b dark:border-gray-700 light:border-b light:border-[#E5E7EB]">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-BrightOrange text-white'
                : 'dark:bg-HeaderWalaBlack dark:text-gray-300 light:bg-[#F3F4F6] light:text-[#6B7280] dark:hover:bg-HeaderWalaBlack/80 light:hover:bg-[#E5E7EB] hover:text-BrightOrange'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'unread'
                ? 'bg-BrightOrange text-white'
                : 'dark:bg-HeaderWalaBlack dark:text-gray-300 light:bg-[#F3F4F6] light:text-[#6B7280] dark:hover:bg-HeaderWalaBlack/80 light:hover:bg-[#E5E7EB] hover:text-BrightOrange'
            }`}
          >
            Unread
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="ml-auto px-4 py-2 rounded-lg dark:bg-HeaderWalaBlack light:bg-[#F3F4F6] dark:text-gray-300 light:text-[#6B7280] dark:hover:bg-HeaderWalaBlack/80 light:hover:bg-[#E5E7EB] hover:text-BrightOrange transition text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-4xl mb-2">📭</span>
              <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition cursor-pointer ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'bg-opacity-20' : 'bg-opacity-10'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{notification.icon || '📢'}</span>
                        <h3 className="font-bold text-white">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-BrightOrange rounded-full"></span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-BrightOrange transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {notification.relatedOrderId && (
                    <div className="mt-3">
                      <a
                        href={`/orders`}
                        className="text-xs bg-BrightOrange/20 text-BrightOrange px-3 py-1 rounded-lg inline-block hover:bg-BrightOrange/30 transition font-medium"
                      >
                        View Order
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
