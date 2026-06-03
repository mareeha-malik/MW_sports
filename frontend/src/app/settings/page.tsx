'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import { Bell, Lock, User, LogOut, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { useTheme } from '../Components/ui/ThemeProvider';

interface UserSettings {
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  twoFactorEnabled?: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    email: '',
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    twoFactorEnabled: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/LoginPage');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setUserId(decoded.id);
      setSettings((prev) => ({
        ...prev,
        username: decoded.username || '',
        email: decoded.email || '',
      }));
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/LoginPage');
    }
  }, [router]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axiosInstance.put(`/user/${userId}`, {
        username: settings.username,
        email: settings.email,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      localStorage.setItem('username', settings.username);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (settings.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setSettings((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      document.cookie = 'access_token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'role=; path=/; max-age=0; samesite=lax';
      document.cookie = 'username=; path=/; max-age=0; samesite=lax';
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F9FAFB] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-[#1F2937] mb-2">
            Settings
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-[#6B7280]">
            Manage your account and preferences
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/20 border border-green-800 text-green-400'
                : 'bg-red-900/20 border border-red-800 text-red-400'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{message.text}</p>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-[#111] dark:bg-[#111] light:bg-white border border-[#222] dark:border-[#222] light:border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-BrightOrange/20 p-3 rounded-lg">
                <User className="w-6 h-6 text-BrightOrange" />
              </div>
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-[#1F2937]">
                Profile Information
              </h2>
            </div>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-[#1F2937] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => handleSettingChange('username', e.target.value)}
                  className="w-full bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] border border-[#333] dark:border-[#333] light:border-[#E5E7EB] rounded-lg px-4 py-3 text-white dark:text-white light:text-[#1F2937] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all"
                  placeholder="Enter your username"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-[#1F2937] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] border border-[#333] dark:border-[#333] light:border-[#E5E7EB] rounded-lg px-4 py-3 text-white dark:text-white light:text-[#1F2937] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-BrightOrange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-[#111] dark:bg-[#111] light:bg-white border border-[#222] dark:border-[#222] light:border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-BrightOrange/20 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-BrightOrange" />
              </div>
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-[#1F2937]">
                Change Password
              </h2>
            </div>

            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-[#1F2937] mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.currentPassword || ''}
                    onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                    className="w-full bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] border border-[#333] dark:border-[#333] light:border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-white dark:text-white light:text-[#1F2937] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-[#1F2937] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={settings.newPassword || ''}
                    onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                    className="w-full bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] border border-[#333] dark:border-[#333] light:border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-white dark:text-white light:text-[#1F2937] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-[#1F2937] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={settings.confirmPassword || ''}
                    onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                    className="w-full bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] border border-[#333] dark:border-[#333] light:border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-white dark:text-white light:text-[#1F2937] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full bg-BrightOrange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-[#111] dark:bg-[#111] light:bg-white border border-[#222] dark:border-[#222] light:border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-BrightOrange/20 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-BrightOrange" />
              </div>
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-[#1F2937]">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              {/* Email Notifications */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-BrightOrange focus:ring-BrightOrange"
                />
                <div>
                  <p className="text-white dark:text-white light:text-[#1F2937] font-medium">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 light:text-[#6B7280]">
                    Receive email updates about your account
                  </p>
                </div>
              </label>

              {/* Order Updates */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={(e) => handleSettingChange('orderUpdates', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-BrightOrange focus:ring-BrightOrange"
                />
                <div>
                  <p className="text-white dark:text-white light:text-[#1F2937] font-medium">
                    Order Updates
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 light:text-[#6B7280]">
                    Get notifications about your order status
                  </p>
                </div>
              </label>

              {/* Promotional Emails */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promotionalEmails}
                  onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-BrightOrange focus:ring-BrightOrange"
                />
                <div>
                  <p className="text-white dark:text-white light:text-[#1F2937] font-medium">
                    Promotional Emails
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 light:text-[#6B7280]">
                    Receive offers and promotions
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-[#111] dark:bg-[#111] light:bg-white border border-[#222] dark:border-[#222] light:border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-BrightOrange/20 p-3 rounded-lg">
                <User className="w-6 h-6 text-BrightOrange" />
              </div>
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-[#1F2937]">
                Appearance
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 dark:text-gray-400 light:text-[#6B7280] text-sm mb-4">
                Choose your preferred theme
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-BrightOrange text-white'
                      : 'bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] text-gray-400 dark:text-gray-400 light:text-[#1F2937] hover:text-white dark:hover:text-white light:hover:text-[#000]'
                  }`}
                >
                  🌙 Dark Mode
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-BrightOrange text-white'
                      : 'bg-BgWalaBlack dark:bg-BgWalaBlack light:bg-[#F3F4F6] text-gray-400 dark:text-gray-400 light:text-[#1F2937] hover:text-white dark:hover:text-white light:hover:text-[#000]'
                  }`}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/10 dark:bg-red-900/10 light:bg-red-50 border border-red-800 dark:border-red-800 light:border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-500 dark:text-red-500 light:text-red-600 mb-4">
              Danger Zone
            </h2>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
