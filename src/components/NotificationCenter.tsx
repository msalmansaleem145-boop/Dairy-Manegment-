import React from 'react';
import { X, Bell, AlertTriangle, Calendar, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectAction: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'calving_expected':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'withdrawal_alert':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'overdue_credit':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/50">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-neutral-900">Notifications & Alerts</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-neutral-600 hover:text-emerald-800 font-medium cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <span>No notifications. Farm operations are running normally.</span>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-colors flex gap-3 text-xs"
              >
                <div className="p-2 rounded-md bg-neutral-100 shrink-0 self-start">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">{item.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{item.date}</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed mb-2">
                    {item.message}
                  </p>
                  {item.actionTab && (
                    <button
                      onClick={() => {
                        onSelectAction(item.actionTab!);
                        onClose();
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] underline cursor-pointer"
                    >
                      View in {item.actionTab} →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 text-center text-[11px] text-neutral-500">
          Alert threshold: Automated breeding & safety triggers active
        </div>
      </div>
    </div>
  );
};
