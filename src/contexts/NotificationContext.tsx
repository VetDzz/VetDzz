import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getNotifications, markNotificationAsRead, createNotification, deleteNotification } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotificationById: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  unreadCount: number;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  const refreshNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await getNotifications(user.id);
      if (error) {

      } else {
        setNotifications(data || []);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await createNotification({
        user_id: user.id,
        ...notificationData
      });

      if (error) {

      } else {
        // Refresh notifications to get the latest
        await refreshNotifications();
      }
    } catch (error) {

    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await markNotificationAsRead(id);
      if (error) {

      } else {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, is_read: true } : notification
          )
        );
      }
    } catch (error) {

    }
  };

  const deleteNotificationById = async (id: string) => {
    try {
      const { error } = await deleteNotification(id);
      if (error) {

      } else {
        // Remove from local state
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    } catch (error) {

    }
  };

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotificationById,
        refreshNotifications,
        unreadCount,
        isLoading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
