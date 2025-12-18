'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface MapNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export default function MapNameModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: MapNameModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      } else if (e.key === 'Enter' && name.trim() && !isLoading) {
        onConfirm(name.trim());
      }
    },
    [name, isLoading, onClose, onConfirm]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (name.trim() && !isLoading) {
      onConfirm(name.trim());
    }
  }, [name, isLoading, onConfirm]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Decorative header gradient */}
        <div className="h-2 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800" />

        <div className="p-6 space-y-6">
          {/* Icon and Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-2">
              <span className="text-3xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              给这张地图起个名字
            </h2>
            <p className="text-gray-500 text-sm">
              为你的新地图取一个有意义的名字吧
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：东京美食地图"
              disabled={isLoading}
              className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-black focus:ring-0 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-300"
              maxLength={50}
            />
            <p className="text-right text-xs text-gray-400">
              {name.length}/50
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 px-4 text-gray-600 font-medium bg-gray-100 rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!name.trim() || isLoading}
              className="flex-1 py-3.5 px-4 text-white font-medium bg-black rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  创建地图
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

