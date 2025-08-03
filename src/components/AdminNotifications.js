import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import { useAdmin } from '../contexts/AdminContext';
import { Link } from 'react-router-dom';

const AdminNotifications = () => {
  const { getAdminNotifications, markNotificationAsRead } = useAdmin();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const fetchedNotifications = await getAdminNotifications();
      setNotifications(fetchedNotifications);
      
      // Count unread notifications
      const unread = fetchedNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get notification content based on type
  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'new_google_user':
        return {
          title: 'New Google Sign-up',
          message: `${notification.userName || notification.userEmail} has signed up with Google and is pending approval.`,
          link: '/admin/pending-users',
          linkText: 'View Pending Users'
        };
      default:
        return {
          title: 'Notification',
          message: 'You have a new notification.',
          link: '',
          linkText: ''
        };
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" id="dropdown-notifications">
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
        <Dropdown.Header>Notifications</Dropdown.Header>
        
        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        )}
        
        {error && (
          <Dropdown.ItemText className="text-danger">
            {error}
          </Dropdown.ItemText>
        )}
        
        {!loading && !error && notifications.length === 0 && (
          <Dropdown.ItemText className="text-muted">
            No notifications
          </Dropdown.ItemText>
        )}
        
        {notifications.map(notification => {
          const content = getNotificationContent(notification);
          return (
            <div key={notification.id} onClick={() => handleMarkAsRead(notification.id)}>
              <Dropdown.Item 
                className={`border-bottom ${!notification.read ? 'bg-light' : ''}`}
                style={{ whiteSpace: 'normal' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <strong>{content.title}</strong>
                  {!notification.read && (
                    <Badge pill bg="primary" className="ms-1">New</Badge>
                  )}
                </div>
                <p className="mb-1">{content.message}</p>
                <small className="text-muted d-block mb-1">
                  {formatNotificationTime(notification.createdAt)}
                </small>
                {content.link && (
                  <Link 
                    to={content.link} 
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content.linkText}
                  </Link>
                )}
              </Dropdown.Item>
            </div>
          );
        })}
        
        {notifications.length > 0 && (
          <Dropdown.ItemText className="text-center">
            <button 
              className="btn btn-sm btn-link" 
              onClick={(e) => {
                e.preventDefault();
                fetchNotifications();
              }}
            >
              Refresh
            </button>
          </Dropdown.ItemText>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminNotifications;