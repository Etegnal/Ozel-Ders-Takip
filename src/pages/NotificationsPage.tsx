import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Check, 
  Trash2, 
  BookOpen, 
  Calendar, 
  Wallet, 
  Info,
  CheckSquare,
  BellRing
} from 'lucide-react';
import { sendNativeNotification } from '../utils/helpers';

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    clearAllNotifications 
  } = useApp();

  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setPermissionStatus('default');
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  const handleRequestPermission = () => {
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

    if (isIOS && !isStandalone) {
      alert("📲 iPhone (iOS) cihazlarda ekran bildirimi almak için:\n\n1. Safari alt menüsündeki 'Paylaş (⬆️)' simgesine dokunun.\n2. 'Ana Ekrana Ekle' seçeneğini seçin.\n3. Ana ekrandaki KOÇ simgesinden girdiğinizde bildirimler 100% aktifleşecektir.");
      return;
    }

    if (typeof window === 'undefined' || (!('Notification' in window) && !('serviceWorker' in navigator))) {
      alert('Cihazınız tarayıcı bildirimlerini desteklemiyor.');
      return;
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      alert('Bildirim izni engellenmiş. Telefonunuzun Ayarlar -> İzinler menüsünden bildirimi açabilirsiniz.');
      return;
    }

    const handleResult = (perm: string) => {
      setPermissionStatus(perm);
      if (perm === 'granted') {
        alert('Bildirim izni başarıyla aktifleştirildi! 📱');
        sendNativeNotification('KOÇ Bildirimleri Aktif 📱', 'Bildirimler telefonunuza ulaşacaktır.');
      } else {
        alert('Bildirim izni verilmedi.');
      }
    };

    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        const res = Notification.requestPermission(handleResult);
        if (res && typeof res.then === 'function') {
          res.then(handleResult).catch(err => {
            console.warn(err);
          });
        }
      } catch (err: any) {
        alert('İzin başlatılamadı: ' + (err?.message || err));
      }
    } else {
      alert("Lütfen uygulamayı telefon ana ekranınıza ekleyip oradan giriniz.");
    }
  };

  const handleSendTestNotification = () => {
    sendNativeNotification('KOÇ Test Bildirimi 📱', 'Tebrikler! Bildirimler telefonunuzun üst bildirim çubuğuna ulaşıyor.');
    alert('Test bildirimi telefonunuza gönderildi! 📱');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return <BookOpen size={16} className="text-blue-400" />;
      case 'lesson':
        return <Calendar size={16} className="text-orange-400" />;
      case 'finance':
        return <Wallet size={16} className="text-emerald-400" />;
      default:
        return <Info size={16} className="text-purple-400" />;
    }
  };

  const getBackground = (type: string) => {
    switch (type) {
      case 'homework':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'lesson':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'finance':
        return 'bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'bg-purple-500/10 border-purple-500/20';
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        markNotificationRead(n.id);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* --- NOTIFICATIONS HEADER WITH SIMPLE RED / GREEN PERMISSION BUTTON --- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-card p-4 border border-border/80 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-text-primary whitespace-nowrap">
          Toplam {notifications.length} Bildirim
        </span>
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
          {/* SIMPLIFIED RED / GREEN PERMISSION BUTTON */}
          {permissionStatus === 'granted' ? (
            <button
              onClick={handleSendTestNotification}
              className="flex-1 sm:flex-initial text-xs px-4 py-2.5 bg-emerald-500 text-black border border-emerald-400 font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/20"
              title="Bildirimler Aktif - Test Yapmak İçin Tıklayın"
            >
              <BellRing size={15} />
              <span>✅ Bildirimler Aktif</span>
            </button>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="flex-1 sm:flex-initial text-xs px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-red-500/30 animate-pulse"
              title="Telefon Bildirimlerini İzin Vererek Aktif Et"
            >
              <Bell size={15} />
              <span>🔔 Bildirimleri Aktif Et</span>
            </button>
          )}

          {notifications.length > 0 && (
            <>
              <button 
                onClick={handleMarkAllRead}
                className="text-xs px-3.5 py-2.5 bg-surface-hover border border-border text-text-secondary hover:text-text-primary rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer whitespace-nowrap"
              >
                <CheckSquare size={14} />
                <span>Tümünü Okundu İşaretle</span>
              </button>
              <button 
                onClick={clearAllNotifications}
                className="text-xs px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer whitespace-nowrap"
              >
                <Trash2 size={14} />
                <span>Temizle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- NOTIFICATIONS LIST --- */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 border rounded-2xl flex items-start justify-between gap-3 transition-all relative group ${
                notif.read ? 'bg-surface-card/40 border-border/40' : 'bg-surface-card border-border/80'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Type Indicator Icon wrapper */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${getBackground(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${notif.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-primary rounded-full glow-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary break-words leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-text-muted block">
                    {new Date(notif.date).toLocaleDateString('tr-TR', { 
                      day: 'numeric', 
                      month: 'long', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {!notif.read && (
                <button 
                  onClick={() => markNotificationRead(notif.id)}
                  className="p-2 hover:bg-surface-hover text-text-muted hover:text-emerald-400 rounded-xl transition-all flex-shrink-0"
                  title="Okundu İşaretle"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface-card border border-border border-dashed rounded-2xl text-text-secondary space-y-2">
            <Bell className="mx-auto w-10 h-10 text-text-muted" />
            <p className="font-semibold text-sm">Henüz Bir Bildirim Bulunmuyor</p>
            <p className="text-xs text-text-muted">Ödev verildiğinde, soru sorulduğunda veya finansal işlem yapıldığında burada görüntülenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
};
