import React from 'react';
import { SecurityNotification } from '../types';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, X, CheckCheck } from 'lucide-react';

interface NotificationsDrawerProps {
  notifications: SecurityNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: SecurityNotification) => void;
  lang?: 'ar' | 'en';
}

export function NotificationsDrawer({
  notifications,
  onClose,
  onMarkAllAsRead,
  onSelectNotification,
  lang = 'ar'
}: NotificationsDrawerProps) {
  const isAr = lang === 'ar';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isAr ? 'مركز التنبيهات الأمنية' : 'Security Notifications'}
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {unreadCount > 0
                ? (isAr ? `${unreadCount} تنبيهات غير مقروءة` : `${unreadCount} unread alerts`)
                : (isAr ? 'جميع التنبيهات مقروءة' : 'All caught up')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
              title={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
            <span>{isAr ? 'لا توجد تنبيهات أمنية حالياً' : 'No alerts recorded'}</span>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectNotification?.(item)}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                item.read
                  ? 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200/80 dark:border-neutral-800/80 opacity-75'
                  : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {item.severity === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : item.severity === 'high' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {isAr ? item.titleAr : item.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {isAr ? item.messageAr : item.message}
                  </p>

                  {item.repo && (
                    <span className="inline-block mt-2 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                      {item.repo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-center">
        <span className="text-[11px] text-neutral-400">
          GitArmor Real-time Event Stream
        </span>
      </div>
    </div>
    </>
  );
}
