import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, BookOpen, AlertCircle, GraduationCap, School } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loginAsStudent } = useApp();
  const [authRole, setAuthRole] = useState<'teacher' | 'student'>('teacher');
  const [isLoginView, setIsLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Teacher Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('Matematik');

  // Student Form states
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authRole === 'student') {
      if (!studentIdInput.trim() || !studentPassword.trim()) {
        setErrorMsg('Lütfen adınızı/e-postanızı ve şifrenizi girin.');
        return;
      }
      const success = loginAsStudent(studentIdInput, studentPassword);
      if (!success) {
        setErrorMsg('Öğrenci kaydı bulunamadı veya şifre hatalı. (Varsayılan şifre: 123456)');
      }
      return;
    }

    if (isLoginView) {
      const success = login(email, password);
      if (!success) {
        setErrorMsg('E-posta adresi veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.');
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Şifre en az 6 karakterden oluşmalıdır.');
        return;
      }
      const success = register(name, email, subject, password);
      if (!success) {
        setErrorMsg('Bu e-posta adresi zaten kullanımda.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-surface-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl p-8 relative z-10 space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/20 mx-auto overflow-hidden">
            <img src={`${(import.meta as any).env.BASE_URL}logo.png`} className="w-full h-full object-cover" alt="Coach Logo" />
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">
            Coach<span className="text-primary">.</span>
          </h2>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
            {authRole === 'student' ? 'ÖĞRENCİ PORTAL GİRİŞİ' : isLoginView ? 'ÖĞRETMEN GİRİŞİ' : 'ÖĞRETMEN KAYIT EKRANI'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-background border border-border/70 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthRole('teacher');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authRole === 'teacher'
                ? 'bg-primary text-black shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <School size={15} />
            <span>Öğretmen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthRole('student');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authRole === 'student'
                ? 'bg-primary text-black shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <GraduationCap size={15} />
            <span>Öğrenci</span>
          </button>
        </div>

        {/* Error Message Alert Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2 animate-pulse-subtle">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STUDENT LOGIN FORM */}
          {authRole === 'student' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">ÖĞRENCİ ADI / E-POSTA / TELEFON</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="text"
                    required
                    placeholder="Örn: Rahmi Koç"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">ŞİFRE</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-text-muted text-right pt-0.5">
                  Varsayılan Şifre: <span className="text-primary font-bold">123456</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 text-sm"
              >
                <span>Öğrenci Paneline Giriş Yap</span>
              </button>
            </>
          ) : (
            /* TEACHER LOGIN / REGISTER FORM */
            <>
              {!isLoginView && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">AD SOYAD</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                      <input
                        type="text"
                        required
                        placeholder="Örn: Rahmi KOÇ"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">BRANŞ / DERS</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Matematik">Matematik</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="Türkçe / Edebiyat">Türkçe / Edebiyat</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                        <option value="Sınıf Öğretmenliği">Sınıf Öğretmenliği</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">E-POSTA ADRESİ</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@ogretmen.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">ŞİFRE</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 text-sm"
              >
                <span>{isLoginView ? 'Giriş Yap' : 'Kayıt Ol & Başla'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setErrorMsg('');
                  }}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4"
                >
                  {isLoginView ? 'Hesabınız yok mu? Yeni öğretmen kaydı oluşturun' : 'Zaten hesabınız var mı? Giriş yapın'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default AuthPage;
