import React from "react";
import { AlertCircle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`p-3 rounded-lg ${
              isDangerous ? "bg-red-500/20" : "bg-yellow-500/20"
            }`}
          >
            {isDangerous ? (
              <Trash2
                size={20}
                className={isDangerous ? "text-red-400" : "text-yellow-400"}
              />
            ) : (
              <AlertCircle
                size={20}
                className={isDangerous ? "text-red-400" : "text-yellow-400"}
              />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 rounded-lg font-medium transition disabled:opacity-50 ${
              isDangerous
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                : "bg-[#F97316] hover:bg-orange-600 text-white"
            }`}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-gray-300 font-medium transition disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
