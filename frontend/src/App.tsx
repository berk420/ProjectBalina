import React, { useEffect, useState, useCallback } from 'react';
import { Transfer, Notification } from './types';
import { initFirebase, requestNotificationPermission, onForegroundMessage } from './services/firebase';
import { registerToken, unregisterToken, getRecentTransfers, checkHealth } from './services/api';
import TransferCard from './components/TransferCard';
import TelegramJoin from './components/TelegramJoin';
import NotificationBell from './components/NotificationBell';
import LiveTicker from './components/LiveTicker';
import TransferChart from './components/TransferChart';
import './App.css';

const App: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmStatus, setFcmStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    () => localStorage.getItem('notifEnabled') !== 'false'
  );
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const loadTransfers = useCallback(async () => {
    const data = await getRecentTransfers(20);
    setTransfers(prev => {
      const prevIds = new Set(prev.map(t => t.id));
      const incoming = data.filter((t: Transfer) => !prevIds.has(t.id));
      if (incoming.length > 0) {
        const ids = new Set<string>(incoming.map((t: Transfer) => t.id));
        setNewIds(ids);
        setTimeout(() => setNewIds(new Set()), 3000);
      }
      return data;
    });
    setLoading(false);
  }, []);

  const setupFCM = useCallback(async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setFcmStatus('denied');
      return;
    }
    setFcmStatus('requesting');
    await initFirebase();
    const token = await requestNotificationPermission();
    if (!token) { setFcmStatus('denied'); return; }
    setFcmStatus('granted');
    setFcmToken(token);
    if (notifEnabled) await registerToken(token);

    onForegroundMessage((payload: any) => {
      const notif: Notification = {
        id: Date.now().toString(),
        title: payload.notification?.title || '🐳 Yeni Transfer',
        body: payload.notification?.body || '',
        data: payload.data,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
      setLiveCount((c) => c + 1);

      if (payload.data?.txHash) {
        const t: Transfer = {
          id: payload.data.txHash,
          from: payload.data.senderAddress,
          to: payload.data.receiverAddress,
          amount: payload.data.amount,
          amountFormatted: payload.data.amountFormatted,
          txHash: payload.data.txHash,
          blockNumber: parseInt(payload.data.blockNumber || '0'),
          timestamp: parseInt(payload.data.timestamp || Date.now().toString()),
        };
        setTransfers((prev) => [t, ...prev.slice(0, 19)]);
      }
    });
  }, []);

  useEffect(() => {
    loadTransfers();
    const interval = setInterval(loadTransfers, 8000);
    return () => clearInterval(interval);
  }, [loadTransfers]);

  useEffect(() => { setupFCM(); }, [setupFCM]);

  const toggleNotifications = useCallback(async () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem('notifEnabled', String(next));
    if (!fcmToken) return;
    if (next) {
      await registerToken(fcmToken);
    } else {
      await unregisterToken(fcmToken);
    }
  }, [notifEnabled, fcmToken]);

  useEffect(() => {
    const ping = async () => setBackendOnline(await checkHealth());
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">

      {/* ── Canlı Ticker ── */}
      <LiveTicker transfers={transfers} />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <span className="logo">🐳</span>
          <div>
            <h1>Balina Takip</h1>
            <p className="subtitle">USDT Büyük Transfer Bildirimleri</p>
          </div>
        </div>
        <div className="header-right">
          <div className="fcm-status">
            {backendOnline === true  && <span className="status-dot green"  title="Backend çalışıyor">● API</span>}
            {backendOnline === false && <span className="status-dot red"    title="Backend çevrimdışı">● API</span>}
            {backendOnline === null  && <span className="status-dot yellow" title="Backend kontrol ediliyor">● API</span>}
            {fcmStatus === 'granted'   && <span className="status-dot green"  title="Bildirimler aktif">●</span>}
            {fcmStatus === 'denied'    && <span className="status-dot red"    title="Bildirim izni verilmedi">●</span>}
            {fcmStatus === 'requesting'&& <span className="status-dot yellow" title="İzin bekleniyor">●</span>}
          </div>
          {fcmStatus === 'granted' && (
            <button
              onClick={toggleNotifications}
              title={notifEnabled ? 'Masaüstü bildirimlerini kapat' : 'Masaüstü bildirimlerini aç'}
              style={{
                background: notifEnabled ? '#ef4444' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              {notifEnabled ? '🔕 Bildirimleri Kapat' : '🔔 Bildirimleri Aç'}
            </button>
          )}
          <NotificationBell notifications={notifications} onClear={() => setNotifications([])} />
        </div>
      </header>

      <main className="app-main">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{transfers.length}</span>
            <span className="stat-label">Tespit Edilen</span>
          </div>
          <div className="stat">
            <span className="stat-value">{liveCount}</span>
            <span className="stat-label">Canlı Bildirim</span>
          </div>
          <div className="stat">
            <span className="stat-value">≥100M</span>
            <span className="stat-label">USDT Eşiği</span>
          </div>
        </div>

        <TelegramJoin />

        <div className="transfers-section">
          <h2>Son Büyük Transferler</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Transferler yükleniyor...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="empty-state">
              <p>🔍 Henüz 100.000 USDT üzerinde transfer tespit edilmedi.</p>
              <p>Ethereum mainnet dinleniyor...</p>
            </div>
          ) : (
            <div className="transfers-grid">
              {transfers.map((t) => (
                <TransferCard key={t.id} transfer={t} isNew={newIds.has(t.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Ethereum Mainnet • USDT Contract:{' '}
          <a href="https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7"
             target="_blank" rel="noopener noreferrer">
            0xdAC17F...ec7
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
