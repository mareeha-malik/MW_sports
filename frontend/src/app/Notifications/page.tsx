'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Check, Bell } from 'lucide-react';
import { useNotifications } from '../Components/hooks/useNotifications';

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

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'orders'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'orders') return ['order_confirmation', 'order_shipped', 'order_delivered', 'order_cancelled'].includes(n.type);
    return true;
  });

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      order_confirmation: '✅',
      order_shipped: '📦',
      order_delivered: '🎉',
      order_cancelled: '❌',
      payment_received: '💳',
      payment_failed: '⚠️',
      price_drop: '💰',
      stock_available: '📍',
      system: '⚙️',
    };
    return icons[type] || '📢';
  };

  const getNotificationBg = (type: string) => {
    const colors: Record<string, string> = {
      order_confirmation: 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-l-4 border-blue-500',
      order_shipped: 'bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-l-4 border-purple-500',
      order_delivered: 'bg-gradient-to-r from-green-600/20 to-green-500/10 border-l-4 border-green-500',
      order_cancelled: 'bg-gradient-to-r from-red-600/20 to-red-500/10 border-l-4 border-red-500',
      payment_received: 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border-l-4 border-emerald-500',
      payment_failed: 'bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-l-4 border-orange-500',
      default: 'bg-gradient-to-r from-slate-600/20 to-slate-500/10 border-l-4 border-slate-500',
    };
    return colors[type] || colors.default;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-BgWalaBlack via-HeaderWalaBlack to-BgWalaBlack pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-10 h-10 text-BrightOrange" />
            Notifications
          </h1>
          <p className="text-gray-400">Stay updated with your orders and account activity</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-BrightOrange text-white'
                  : 'bg-HeaderWalaBlack text-gray-300 hover:bg-HeaderWalaBlack/80 hover:text-BrightOrange'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-BrightOrange text-white'
                  : 'bg-HeaderWalaBlack text-gray-300 hover:bg-HeaderWalaBlack/80 hover:text-BrightOrange'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-BrightOrange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('orders')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'orders'
                  ? 'bg-BrightOrange text-white'
                  : 'bg-HeaderWalaBlack text-gray-300 hover:bg-HeaderWalaBlack/80 hover:text-BrightOrange'
              }`}
            >
              Orders
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg bg-HeaderWalaBlack text-gray-300 hover:bg-HeaderWalaBlack/80 hover:text-BrightOrange transition text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h2>
            <p className="text-gray-400">
              {filter === 'unread'
                ? 'You are all caught up!'
                : 'You will see notifications here as things happen'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 rounded-lg border border-slate-700/50 transition hover:border-slate-600/50 ${getNotificationBg(
                  notification.type
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="text-3xl flex-shrink-0">
                      {notification.icon || getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-block w-3 h-3 bg-BrightOrange rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{notification.message}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.relatedOrderId && (
                          <a
                            href={`/orders`}
                            className="text-sm bg-BrightOrange/30 text-BrightOrange px-3 py-1 rounded-lg hover:bg-BrightOrange/50 transition font-medium"
                          >
                            View Order
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                        className="p-2 text-gray-400 hover:text-BrightOrange transition"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                      className="p-2 text-gray-400 hover:text-BrightOrange transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
