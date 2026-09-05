import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if dismissed before
    const dismissed = localStorage.getItem('koc_pwa_dismissed');
    if (!dismissed && (window.navigator as any).standalone === false) {
      // iOS Safari hint or Standalone check
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Request push notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('koc_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-surface border border-primary/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md bg-opacity-95 animate-slide-up flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0 font-bold">
            <Smartphone size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">KOÇ Uygulamasını Yükleyin 📱</h4>
            <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
              Ana ekranınıza ekleyip mobil uygulama gibi anında erişebilirsiniz.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-primary transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-primary hover:bg-primary-hover text-black text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer min-w-[120px]"
        >
          <Download size={14} />
          <span>Ana Ekrana Ekle</span>
        </button>

        <a
          href="./koc-setup.exe"
          download="koc-setup.exe"
          className="px-3 py-2.5 bg-surface-card hover:bg-surface-hover text-text-primary border border-border text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          title="Windows Masaüstü Kurulum EXE İndir"
        >
          <Download size={14} className="text-primary" />
          <span>Masaüstü EXE</span>
        </a>

        <a
          href="./koc-app.apk"
          download="koc-app.apk"
          className="px-3 py-2.5 bg-surface-card hover:bg-surface-hover text-text-primary border border-border text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          title="Android APK İndir"
        >
          <Download size={14} className="text-primary" />
          <span>APK</span>
        </a>
      </div>
    </div>
  );
};
