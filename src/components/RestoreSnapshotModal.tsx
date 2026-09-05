import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { History, RotateCcw, X, CheckCircle, AlertTriangle, Database } from 'lucide-react';

interface RestoreSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestoreSnapshotModal: React.FC<RestoreSnapshotModalProps> = ({ isOpen, onClose }) => {
  const { syncCloudNow } = useApp();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSnapshots = async () => {
    setIsLoading(true);
    try {
      const endpoint = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
        ? '/api/sync?snapshots=true'
        : 'https://koc-one.vercel.app/api/sync?snapshots=true';

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (e) {
      console.error('Failed to fetch snapshots:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSnapshots();
    }
  }, [isOpen]);

  const handleRestore = async (id: string) => {
    if (!window.confirm('Bu veritabanı yedeğini geri yüklemek istediğinize emin misiniz?')) return;

    setRestoringId(id);
    try {
      const endpoint = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
        ? `/api/sync?restoreId=${id}`
        : `https://koc-one.vercel.app/api/sync?restoreId=${id}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        await syncCloudNow();
        setSuccessMsg('Veritabanı yedeği başarıyla geri yüklendi!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error('Restore error:', e);
      alert('Geri yükleme sırasında hata oluştu.');
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-surface-card to-surface-card border-b border-border/60 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0 font-bold">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>Otomatik Veritabanı Yedekleri & Geri Yükleme</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Sistemin otomatik aldığı geçmiş veritabanı yedeklerinden birini seçip tek tıkla geri yükleyin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-xs text-text-muted space-y-2">
              <History size={24} className="mx-auto animate-spin text-primary opacity-60" />
              <p>Otomatik veritabanı yedekleri taranıyor...</p>
            </div>
          ) : snapshots.length > 0 ? (
            <div className="space-y-2.5 divide-y divide-border/30">
              {snapshots.map(snap => (
                <div key={snap.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        Yedek: {new Date(snap.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold border border-primary/20">
                        👨‍Öğretmen: {snap.teacher_count || 0}
                      </span>
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-semibold border border-blue-500/20">
                        👨‍🎓 Öğrenci: {snap.student_count || 0}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-semibold border border-emerald-500/20">
                        📚 Ders: {snap.lesson_count || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(snap.id)}
                    disabled={restoringId === snap.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-primary/20 text-text-primary hover:text-primary border border-border hover:border-primary/40 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw size={13} className={restoringId === snap.id ? 'animate-spin' : ''} />
                    <span>{restoringId === snap.id ? 'Yükleniyor...' : 'Geri Yükle'}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-text-muted space-y-2">
              <AlertTriangle size={28} className="mx-auto text-amber-400 opacity-60" />
              <p className="font-semibold text-text-primary">Henüz Kayıtlı Yedek Bulunmuyor</p>
              <p className="text-[11px]">Sistem her veri değişiminde otomatik yedek almaya devam edecektir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
