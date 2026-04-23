import React from 'react';
import { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onClear: () => void;
}

const NotificationBell: React.FC<Props> = ({ notifications, onClear }) => {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-bell">
      <div className="bell-icon">
        🔔
        {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
      </div>
      {notifications.length > 0 && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <span>Bildirimler ({notifications.length})</span>
            <button onClick={onClear} className="clear-btn">Temizle</button>
          </div>
          <div className="notification-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-time">
                  {new Date(n.timestamp).toLocaleTimeString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
