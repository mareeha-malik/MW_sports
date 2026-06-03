"use client";

import { useState, useEffect } from "react";
import { Save, Lock, Mail, Phone, Globe, Database, Shield, Zap, Bell, ChevronDown} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/app/utils/api";

interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  storeAddress: string;
  storeCity: string;
  storeCountry: string;
  taxRate: number;
  shippingCost: number;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories?: Category[];
  isExpanded?: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [optimizingDb, setOptimizingDb] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedStates, setSavedStates] = useState({
    store: false,
    notifications: false,
    security: false,
    password: false,
    cache: false,
    db: false,
  });
  const [formData, setFormData] = useState<StoreSettings>({
    storeName: "MW Sports",
    contactEmail: "contact@mwsports.com",
    contactPhone: "+92 123 456 7890",
    whatsappNumber: "+92 123 456 7890",
    storeAddress: "123 Sports Lane",
    storeCity: "Karachi",
    storeCountry: "Pakistan",
    taxRate: 17,
    shippingCost: 200,
    currency: "PKR",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnOrder: true,
    emailOnReview: true,
    emailOnLowStock: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    ipWhitelist: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      if (res.data) {
        // Initialize categories with expanded state
        const categoriesWithState = Array.isArray(res.data) 
          ? res.data.map((cat: any) => ({
              ...cat,
              isExpanded: false,
              subcategories: cat.subcategories || []
            }))
          : [];
        setCategories(categoriesWithState);
      }
    } catch (err: any) {
      console.warn("Failed to load categories", err?.response?.status);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/settings");
      
      // Handle the response - settings might be an empty object if first time
      if (res.data && typeof res.data === 'object') {
        setFormData(prev => ({
          ...prev,
          storeName: res.data.storeName || prev.storeName,
          contactEmail: res.data.contactEmail || prev.contactEmail,
          contactPhone: res.data.contactPhone || prev.contactPhone,
          whatsappNumber: res.data.whatsappNumber || prev.whatsappNumber,
          storeAddress: res.data.storeAddress || prev.storeAddress,
          storeCity: res.data.storeCity || prev.storeCity,
          storeCountry: res.data.storeCountry || prev.storeCountry,
          taxRate: res.data.taxRate ?? prev.taxRate,
          shippingCost: res.data.shippingCost ?? prev.shippingCost,
          currency: res.data.currency || prev.currency,
        }));

        setNotificationSettings({
          emailOnOrder: res.data.emailOnOrder ?? true,
          emailOnReview: res.data.emailOnReview ?? true,
          emailOnLowStock: res.data.emailOnLowStock ?? true,
          pushNotifications: res.data.pushNotifications ?? true,
          smsNotifications: res.data.smsNotifications ?? false,
        });

        setSecuritySettings({
          twoFactorEnabled: res.data.twoFactorEnabled ?? false,
          ipWhitelist: res.data.ipWhitelist ?? false,
          sessionTimeout: res.data.sessionTimeout ?? 30,
          passwordExpiry: res.data.passwordExpiry ?? 90,
        });
      }
    } catch (err: any) {
      // Silently handle error and use defaults - settings endpoint may not be available on first load
      console.warn("Settings endpoint not available yet, using defaults", err?.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isExpanded: !cat.isExpanded }
        : cat
    ));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStore(true);
      await axiosInstance.post("/admin/settings/store", formData);
      
      setSavedStates(prev => ({ ...prev, store: true }));
      toast.success("Settings saved successfully");
      
      // Reset saved state after 2 seconds
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, store: false }));
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to save settings";
      toast.error(errorMessage);
    } finally {
      setSavingStore(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setSavingPassword(true);
      await axiosInstance.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setSavedStates(prev => ({ ...prev, password: true }));
      toast.success("✓ Password changed successfully! You can now log in with your new password.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Reset saved state after 2 seconds
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, password: false }));
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to change password";
      // Check if it's a current password error
      if (errorMessage.includes("Current password") || errorMessage.includes("incorrect")) {
        setPasswordError(errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingNotifications(true);
      await axiosInstance.post("/admin/settings/notifications", notificationSettings);
      
      setSavedStates(prev => ({ ...prev, notifications: true }));
      toast.success("Notification settings saved");
      
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, notifications: false }));
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to save notification settings";
      toast.error(errorMessage);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSecurity(true);
      await axiosInstance.post("/admin/settings/security", securitySettings);
      
      setSavedStates(prev => ({ ...prev, security: true }));
      toast.success("Security settings saved");
      
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, security: false }));
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to save security settings";
      toast.error(errorMessage);
    } finally {
      setSavingSecurity(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your store and account settings</p>
      </div>

      {/* Store Information */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe size={20} />
          Store Information
        </h2>
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Default Shipping Cost (PKR)</label>
            <input
              type="number"
              value={formData.shippingCost}
              onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">Store Address</label>
            <input
              type="text"
              value={formData.storeAddress}
              onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={formData.storeCity}
              onChange={(e) => setFormData({ ...formData, storeCity: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Country</label>
            <input
              type="text"
              value={formData.storeCountry}
              onChange={(e) => setFormData({ ...formData, storeCountry: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <button
            type="submit"
            disabled={savingStore}
            className={`lg:col-span-2 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition mt-6 ${
              savingStore 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.store
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#F97316] hover:bg-orange-600"
            }`}
          >
            {savingStore ? (
              <>
                Saving...
              </>
            ) : savedStates.store ? (
              <>
                <span>✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Store Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notification Settings
        </h2>
        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="space-y-3">
            {[
              { key: "emailOnOrder", label: "Email notifications on new orders" },
              { key: "emailOnReview", label: "Email notifications on product reviews" },
              { key: "emailOnLowStock", label: "Email alerts for low stock items" },
              { key: "pushNotifications", label: "Browser push notifications" },
              { key: "smsNotifications", label: "SMS notifications" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key as keyof typeof notificationSettings]}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 bg-[#0a0a0a] border border-[#222] rounded cursor-pointer accent-[#F97316]"
                />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={savingNotifications}
            className={`text-white py-2 px-4 rounded-lg flex items-center gap-2 transition ${
              savingNotifications 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.notifications
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#F97316] hover:bg-orange-600"
            }`}
          >
            {savingNotifications ? (
              <>
                {/* <div className="animate-spin">⏳</div> */}
                Saving...
              </>
            ) : savedStates.notifications ? (
              <>
                <span>✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Notification Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={20} />
          Security Settings
        </h2>
        <form onSubmit={handleSaveSecurity} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })
                }
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password Expiry (days)</label>
              <input
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })
                }
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })
                }
                className="w-4 h-4 bg-[#0a0a0a] border border-[#222] rounded cursor-pointer accent-[#F97316]"
              />
              <span className="text-sm text-gray-300">Enable two-factor authentication</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.ipWhitelist}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.checked })
                }
                className="w-4 h-4 bg-[#0a0a0a] border border-[#222] rounded cursor-pointer accent-[#F97316]"
              />
              <span className="text-sm text-gray-300">Enable IP whitelist</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={savingSecurity}
            className={`text-white py-2 px-4 rounded-lg flex items-center gap-2 transition ${
              savingSecurity 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.security
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#F97316] hover:bg-orange-600"
            }`}
          >
            {savingSecurity ? (
              <>
                {/* <div className="animate-spin">⏳</div> */}
                Saving...
              </>
            ) : savedStates.security ? (
              <>
                <span>✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Security Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={20} />
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                // Clear error when user starts typing
                if (passwordError) setPasswordError("");
              }}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-2 text-white focus:outline-none transition ${
                passwordError
                  ? "border-red-500 focus:border-red-600"
                  : "border-[#222] focus:border-[#F97316]"
              }`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-xs text-red-400 mt-1">✗ {passwordError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-2 text-white focus:outline-none transition ${
                passwordForm.newPassword && passwordForm.newPassword.length < 8
                  ? "border-red-500 focus:border-red-600"
                  : passwordForm.newPassword && passwordForm.newPassword.length >= 8
                  ? "border-green-500 focus:border-green-600"
                  : "border-[#222] focus:border-[#F97316]"
              }`}
              placeholder="••••••••"
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">Minimum 8 characters required</p>
              {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                <p className="text-xs text-red-400">Too short ({passwordForm.newPassword.length}/8)</p>
              )}
              {passwordForm.newPassword && passwordForm.newPassword.length >= 8 && (
                <p className="text-xs text-green-400">✓ Valid</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-2 text-white focus:outline-none transition ${
                passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                  ? "border-red-500 focus:border-red-600"
                  : passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 8
                  ? "border-green-500 focus:border-green-600"
                  : "border-[#222] focus:border-[#F97316]"
              }`}
              placeholder="••••••••"
            />
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">✗ Passwords do not match</p>
            )}
            {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 8 && (
              <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className={`text-white py-2 px-4 rounded-lg flex items-center gap-2 transition ${
              savingPassword 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.password
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#F97316] hover:bg-orange-600"
            }`}
          >
            {savingPassword ? (
              <>
                {/* <div className="animate-spin">⏳</div> */}
                Changing...
              </>
            ) : savedStates.password ? (
              <>
                <span>✓</span>
                Updated!
              </>
            ) : (
              <>
                <Lock size={18} />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Database Maintenance */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database size={20} />
          Maintenance
        </h2>
        <div className="space-y-3">
          <button
            onClick={async () => {
              try {
                setClearingCache(true);
                toast.loading("Clearing cache...");
                await axiosInstance.post("/admin/settings/cache/clear");
                toast.dismiss();
                setSavedStates(prev => ({ ...prev, cache: true }));
                toast.success("Cache cleared successfully");
                setTimeout(() => {
                  setSavedStates(prev => ({ ...prev, cache: false }));
                }, 2000);
              } catch (err) {
                toast.dismiss();
                toast.error("Failed to clear cache");
              } finally {
                setClearingCache(false);
              }
            }}
            disabled={clearingCache}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              clearingCache 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.cache
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#0a0a0a] hover:bg-[#111] border border-[#222]"
            } text-white`}
          >
            {clearingCache ? (
              <>
                {/* <div className="animate-spin">⏳</div> */}
                Clearing...
              </>
            ) : savedStates.cache ? (
              <>
                <span>✓</span>
                Cleared!
              </>
            ) : (
              <>
                <Zap size={18} />
                Clear Cache
              </>
            )}
          </button>

          <button
            onClick={async () => {
              try {
                setOptimizingDb(true);
                toast.loading("Optimizing database...");
                await axiosInstance.post("/admin/settings/database/optimize");
                toast.dismiss();
                setSavedStates(prev => ({ ...prev, db: true }));
                toast.success("Database optimized successfully");
                setTimeout(() => {
                  setSavedStates(prev => ({ ...prev, db: false }));
                }, 2000);
              } catch (err) {
                toast.dismiss();
                toast.error("Failed to optimize database");
              } finally {
                setOptimizingDb(false);
              }
            }}
            disabled={optimizingDb}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              optimizingDb 
                ? "bg-gray-600 cursor-not-allowed" 
                : savedStates.db
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#0a0a0a] hover:bg-[#111] border border-[#222]"
            } text-white`}
          >
            {optimizingDb ? (
              <>
                {/* <div className="animate-spin">⏳</div> */}
                Optimizing...
              </>
            ) : savedStates.db ? (
              <>
                <span>✓</span>
                Optimized!
              </>
            ) : (
              <>
                <Database size={18} />
                Optimize Database
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
