import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUnreadCount,
  subscribeToNotifications,
  markAllAsRead,
} from '../services/notificationService';
import { registerForPushNotifications, scheduleLocalNotification } from '../utils/pushNotifications';

type NotificationContextType = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  clearUnread: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    const count = await getUnreadCount(user.id);
    setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshUnread();
    registerForPushNotifications();

    const unsub = subscribeToNotifications(user.id, async (notification) => {
      setUnreadCount((c) => c + 1);
      await scheduleLocalNotification(notification.title, notification.body || '');
    });

    return unsub;
  }, [user, refreshUnread]);

  const clearUnread = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
