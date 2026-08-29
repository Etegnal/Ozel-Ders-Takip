import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, BookOpen, AlertCircle, GraduationCap, School, Phone } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loginAsStudent, registerStudent, teachers } = useApp();
  const [authRole, setAuthRole] = useState<'teacher' | 'student'>('teacher');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isStudentLoginView, setIsStudentLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Teacher Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('Matematik');

  // Student Form states
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Student registration states
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail] = useState('');
  const [studentGrade] = useState('12. Sınıf (YKS)');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Loading & Remember Me states
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Restore remembered user info ONCE on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('coach_remember_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.remember) {
          if (parsed.teacherEmail) setEmail(parsed.teacherEmail);
          if (parsed.studentId) setStudentIdInput(parsed.studentId);
          if (parsed.role) setAuthRole(parsed.role);
          setRememberMe(true);
        }
      }
    } catch {}
  }, []);

  // Auto-select first teacher if not selected
  React.useEffect(() => {
    if (teachers && teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('coach_remember_user', JSON.stringify({
          teacherEmail: email,
          studentId: studentIdInput,
          role: authRole,
          remember: true
        }));
      } else {
        localStorage.removeItem('coach_remember_user');
      }

      if (authRole === 'student') {
        if (isStudentLoginView) {
          if (!studentIdInput.trim() || !studentPassword.trim()) {
            setErrorMsg('Lütfen adınızı/e-postanızı ve şifrenizi girin.');
            setLoading(false);
            return;
          }
          const success = await loginAsStudent(studentIdInput, studentPassword);
          if (!success) {
            setErrorMsg('Öğrenci kaydı bulunamadı veya şifre hatalı.');
          }
        } else {
          if (!studentName.trim() || !studentPhone.trim() || !studentPassword.trim()) {
            setErrorMsg('Lütfen ad soyad, telefon ve şifre alanlarını doldurun.');
            setLoading(false);
            return;
          }
          if (studentPassword.length < 4) {
            setErrorMsg('Şifre en az 4 karakterden oluşmalıdır.');
            setLoading(false);
            return;
          }
          const success = await registerStudent(studentName, studentEmail, studentPhone, studentGrade, studentPassword, selectedTeacherId);
          if (!success) {
            setErrorMsg('Bu telefon numarası ile kayıtlı öğrenci zaten var.');
            setLoading(false);
            return;
          }
        }
        setLoading(false);
        return;
      }

      if (isLoginView) {
        const success = await login(email, password);
        if (!success) {
          setErrorMsg('E-posta adresi veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.');
        }
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Şifre en az 6 karakterden oluşmalıdır.');
          setLoading(false);
          return;
        }
        const success = await register(name, email, subject, password);
        if (!success) {
          setErrorMsg('Bu e-posta adresi zaten kullanımda.');
        }
      }
    } finally {
      setLoading(false);
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
            KOÇ
          </h2>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
            {authRole === 'student' ? (isStudentLoginView ? 'ÖĞRENCİ PORTAL GİRİŞİ' : 'YENİ ÖĞRENCİ KAYIT EKRANI') : isLoginView ? 'ÖĞRETMEN GİRİŞİ' : 'ÖĞRETMEN KAYIT EKRANI'}
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
          
          {/* STUDENT LOGIN & REGISTER FORM */}
          {authRole === 'student' ? (
            isStudentLoginView ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">TELEFON NUMARASI VEYA AD SOYAD</label>
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
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Beni Hatırla</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 text-sm cursor-pointer"
                >
                  <span>{loading ? 'Kontrol Ediliyor...' : 'Öğrenci Paneline Giriş Yap'}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudentLoginView(false);
                      setErrorMsg('');
                    }}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    Öğrenci hesabınız yok mu? Yeni öğrenci kaydı oluşturun
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">ÖĞRENCİ AD SOYAD</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">TELEFON NUMARASI</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                    <input
                      type="tel"
                      required
                      placeholder="Örn: 05551234567"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 text-sm cursor-pointer"
                >
                  <span>{loading ? 'Kayıt Yapılıyor...' : 'Öğrenci Kaydını Tamamla'}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudentLoginView(true);
                      setErrorMsg('');
                    }}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    Zaten hesabınız var mı? Giriş yapın
                  </button>
                </div>
              </>
            )
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
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                  {isLoginView ? 'E-POSTA VEYA AD SOYAD' : 'E-POSTA ADRESİ'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type={isLoginView ? "text" : "email"}
                    required
                    placeholder={isLoginView ? "E-Posta adresi veya Ad Soyad" : "ornek@ogretmen.com"}
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

              {isLoginView && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Beni Hatırla</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 mt-2 text-sm cursor-pointer"
              >
                <span>{loading ? 'İşlem Yapılıyor...' : isLoginView ? 'Giriş Yap' : 'Kayıt Ol & Başla'}</span>
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
