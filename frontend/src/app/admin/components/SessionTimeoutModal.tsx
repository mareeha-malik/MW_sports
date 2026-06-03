import React, { useEffect, useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";

interface SessionTimeoutModalProps {
  warningTime?: number; // in minutes, default 25
  logoutTime?: number; // in minutes, default 30
  onLogout: () => void;
}

export function SessionTimeoutModal({
  warningTime = 25,
  logoutTime = 30,
  onLogout,
}: SessionTimeoutModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    let warningTimeout: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const warningMs = warningTime * 60 * 1000;
    const logoutMs = logoutTime * 60 * 1000;

    warningTimeout = setTimeout(() => {
      setShowWarning(true);
      const countdownMs = (logoutTime - warningTime) * 60 * 1000;
      setTimeLeft(Math.floor(countdownMs / 1000));

      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }, warningMs);

    const logoutTimeout = setTimeout(() => {
      onLogout();
    }, logoutMs);

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(countdownInterval);
    };
  }, [warningTime, logoutTime, onLogout]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 rounded-lg bg-yellow-500/20">
            <AlertTriangle size={20} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Session Expiring Soon</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your session will expire in{" "}
              <span className="text-yellow-400 font-semibold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-6">
          You will be automatically logged out. Click below to stay signed in.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowWarning(false);
              window.location.reload();
            }}
            className="flex-1 py-2 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white font-medium transition"
          >
            Stay Signed In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-gray-300 font-medium transition flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
