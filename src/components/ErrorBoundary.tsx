import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
            ⚠️
          </div>
          <h1 className="text-xl font-bold mb-2">Uygulama Yüklenirken Bir Hata Oluştu</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Cihazınızdaki önbellek veya ağ bağlantısından kaynaklı geçici bir görüntüleme hatası alındı.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-primary-hover transition-all"
            >
              Yeniden Yükle
            </button>
            <button
              onClick={this.handleReset}
              className="bg-surface-card border border-border text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl hover:text-white cursor-pointer transition-all"
            >
              Önbelleği Temizle & Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
