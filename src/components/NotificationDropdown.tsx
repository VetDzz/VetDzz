import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const NotificationDropdown = () => {
  const { notifications, markAsRead, deleteNotificationById, refreshNotifications, unreadCount, isLoading } = useNotifications();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if navbar is scrolled to determine text color
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotificationClick = (notification: any) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Mark as read
    markAsRead(notification.id);

    // Navigate based on notification type and user type
    if (notification.related_entity_type === 'test_result') {
      if (user?.type === 'client') {
        navigate('/client-dashboard?tab=results');
      } else {
        navigate('/laboratory-dashboard');
      }
    } else if (notification.related_entity_type === 'test_request') {
      if (user?.type === 'laboratory') {
        navigate('/laboratory-dashboard');
      } else {
        navigate('/client-dashboard?tab=results');
      }
    } else {
      // Default navigation based on user type
      if (user?.type === 'client') {
        navigate('/client-dashboard?tab=notifications');
      } else if (user?.type === 'laboratory') {
        navigate('/laboratory-dashboard');
      } else {
        navigate('/auth');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const formatTime = (created_at: string) => {
    const now = new Date();
    const timestamp = new Date(created_at);
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-laboratory-light bg-white text-gray-700 hover:text-gray-900"
        >
          <Bell className="h-4 w-4 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t('notifications.title')}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNotifications}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {t('common.refresh')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {t('notifications.loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {t('notifications.empty')}
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-laboratory-light/30' : ''
                }`}
              >
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      <h4 className={`text-sm font-medium truncate ${
                        !notification.is_read ? 'text-laboratory-dark' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-laboratory-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-laboratory-dark hover:text-laboratory-accent"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {t('notifications.view')}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={async () => {
                              await markAsRead(notification.id);
                              await refreshNotifications();
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={async () => {
                            await deleteNotificationById(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-laboratory-dark hover:bg-laboratory-light"
                onClick={() => navigate('/client-dashboard?tab=notifications')}
              >
                {t('notifications.viewAll')}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
