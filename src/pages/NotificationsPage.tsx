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
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Send
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
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionStatus(perm);
        if (perm === 'granted') {
          sendNativeNotification('KOÇ Bildirimleri Aktif 📱', 'Telefonunuza bildirimler başarıyla gönderilecektir.');
        } else if (perm === 'denied') {
          alert('Bildirim izni engellendi. Telefon/Tarayıcı ayarlarından site izinlerini açmanız gerekmektedir.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleSendTestNotification = () => {
    sendNativeNotification('KOÇ Test Bildirimi 📱', 'Tebrikler! Bildirimler telefonunuzun üst çubuğuna başarıyla ulaşıyor.');
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
      {/* --- DEDICATED NOTIFICATION SETTINGS & PERMISSION CARD --- */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span>📱 TELEFON ÜST BİLDİRİM AYARLARI</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Cihazınızın kilit veya ana ekranında yukarıdan kaydırılan bildirim çubuğu yönetimi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            {permissionStatus === 'granted' ? (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck size={14} />
                <span>İzin Verildi (Aktif)</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap">
                <AlertTriangle size={14} />
                <span>İzin Bekleniyor</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-xs text-text-muted leading-relaxed max-w-xl">
            Soru çözüldüğünde, yeni soru yüklendiğinde veya ödev verildiğinde telefonunuz kilitli olsa bile ekranın üst bildirim paneline anlık bildirim düşer.
          </p>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
            {permissionStatus === 'granted' ? (
              <button
                onClick={handleSendTestNotification}
                className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 cursor-pointer whitespace-nowrap"
              >
                <Send size={14} />
                <span>Test Bildirimi Gönder 🔔</span>
              </button>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 cursor-pointer whitespace-nowrap animate-pulse"
              >
                <Bell size={14} />
                <span>📱 Telefon Bildirimlerini Aktif Et</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- NOTIFICATIONS LIST CONTROLS HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card/30 p-4 border border-border/80 rounded-2xl">
        <span className="text-xs font-bold text-text-primary whitespace-nowrap">
          Toplam {notifications.length} Bildirim Kaydı
        </span>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
            <button 
              onClick={handleMarkAllRead}
              className="flex-1 sm:flex-initial text-xs px-3.5 py-2.5 bg-surface-card border border-border text-text-secondary hover:text-text-primary rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer whitespace-nowrap"
            >
              <CheckSquare size={14} />
              <span>Tümünü Okundu İşaretle</span>
            </button>
            <button 
              onClick={clearAllNotifications}
              className="flex-1 sm:flex-initial text-xs px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer whitespace-nowrap"
            >
              <Trash2 size={14} />
              <span>Temizle</span>
            </button>
          </div>
        )}
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
