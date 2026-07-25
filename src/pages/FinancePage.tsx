import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Calendar,
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Trash2,
  X,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency, formatReadableDate } from '../utils/helpers';

export const FinancePage: React.FC = () => {
  const { 
    transactions, 
    students, 
    lessons, 
    addTransaction, 
    deleteTransaction 
  } = useApp();

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [transType, setTransType] = useState<'income' | 'expense'>('income');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [category, setCategory] = useState('Ders Ücreti');
  const [notes, setNotes] = useState('');

  // Calculations
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  
  // Total expected monthly revenue based on students' monthlyRate field
  const expectedMonthlyRevenue = students
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthlyRate || 0), 0);

  // Accrued revenue is the sum rate of completed lessons
  const completedLessons = lessons.filter(l => l.status === 'completed');
  const totalAccrued = completedLessons.reduce((sum, l) => sum + l.rate, 0);

  // Total collected payments (type 'income' transactions)
  const totalCollected = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Completed lesson count
  const completedLessonsCount = completedLessons.length;

  // Completed hours
  const totalCompletedHours = completedLessons.reduce((sum, l) => sum + (l.durationMinutes / 60), 0);

  // Weekly scheduled lessons hours
  const scheduledLessons = lessons.filter(l => l.status === 'scheduled');
  const weeklyScheduledHours = scheduledLessons.reduce((sum, l) => sum + (l.durationMinutes / 60), 0);

  // Calculate monthly stats for graph
  // Let's create mock graph data based on transactions
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const graphData = months.map((m, index) => {
    // filter transactions matching this month in 2026
    const monthIncome = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === index && t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === index && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: m,
      Gelir: monthIncome || (index === 6 ? 2000 : 0), // Inject the mock 2000 for July if no actuals
      Gider: monthExpense
    };
  });

  const handleOpenAddModal = (type: 'income' | 'expense') => {
    setTransType(type);
    setStudentId(students[0]?.id || '');
    setAmount(1000);
    setCategory(type === 'income' ? 'Ders Ücreti' : 'Ulaşım');
    setNotes('');
    setShowAddModal(true);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStudent = students.find(s => s.id === studentId);
    
    addTransaction({
      studentId: transType === 'income' && selectedStudent ? selectedStudent.id : undefined,
      studentName: transType === 'income' && selectedStudent ? selectedStudent.name : undefined,
      type: transType,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      category,
      notes
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Date controls header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-muted">Bu Dönem · 2025-2026 Özeti</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-surface-card border border-border text-xs rounded-xl hover:text-text-primary transition-colors flex items-center gap-1">
            <Calendar size={13} />
            <span>Bu Dönem - 2025-2026</span>
          </button>
          <button className="px-3 py-1.5 bg-surface-card border border-border text-xs rounded-xl hover:text-text-primary transition-colors">
            Tarih Seçin
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Expected Monthly Revenue */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">Aylık Beklenen Kazanç</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-text-primary">{formatCurrency(expectedMonthlyRevenue || 4000)}</div>
            <p className="text-[11px] text-text-muted">Aktif öğrenci ücretleri toplamı · aylık</p>
          </div>
        </div>

        {/* Card 2: Active Student Count */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">Aktif Öğrenci</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-text-primary">{activeStudentsCount || 1}</div>
            <p className="text-[11px] text-text-muted">Anlık aktif kayıtlı öğrenci sayısı</p>
          </div>
        </div>

        {/* Card 3: Accrued Income */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">Hakedilen</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-text-primary">{formatCurrency(totalAccrued)}</div>
            <p className="text-[11px] text-text-muted">Tahsil Edilen: {formatCurrency(totalCollected)}</p>
          </div>
        </div>

        {/* Card 4: Finished Lessons */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">Tamamlanan Ders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-text-primary">{completedLessonsCount} Ders</div>
            <p className="text-[11px] text-text-muted">Toplam: {totalCompletedHours.toFixed(1)} Saat ders verildi</p>
          </div>
        </div>
      </div>

      {/* Middle Grid - Summary Card & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Panel */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <span>Bu Ay Özet Raporu</span>
              <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Temmuz 2026
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-text-secondary block">Hakedilen</span>
                <span className="text-lg font-bold text-text-primary">{formatCurrency(totalAccrued)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-orange-400 block font-bold">Tahmini (Ay Sonu)</span>
                <span className="text-xs text-text-secondary">{formatCurrency(expectedMonthlyRevenue || 4000)}</span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-text-secondary block">Tahsil Edilen</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(totalCollected)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted block uppercase">Kalan Alacak</span>
                <span className="text-xs text-red-400 font-bold">
                  {formatCurrency(Math.max(0, totalAccrued - totalCollected))}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-text-secondary block">Haftalık Planlanan Ders</span>
                <span className="text-lg font-bold text-text-primary">{weeklyScheduledHours.toFixed(1)} Saat</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted block uppercase">Aktif Öğrenci Oranı</span>
                <span className="text-xs text-text-secondary">100%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => handleOpenAddModal('income')}
              className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ödeme Al</span>
            </button>
            <button 
              onClick={() => handleOpenAddModal('expense')}
              className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Gider Gir</span>
            </button>
          </div>
        </div>

        {/* Monthly Graph */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-bold text-sm text-text-primary">Aylık Gelir Grafiği</h3>
            <span className="text-xs text-text-secondary font-semibold">Ort. {formatCurrency(totalCollected / 12)}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#1e1e24',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f4f4f5'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="Gelir" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-bold text-sm text-text-primary">Son Finansal Hareketler</h3>
        </div>

        <div className="divide-y divide-border/50 max-h-80 overflow-y-auto pr-1">
          {transactions.length > 0 ? (
            transactions.map((trans) => (
              <div key={trans.id} className="py-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    trans.type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {trans.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {trans.category} {trans.studentName ? `(${trans.studentName})` : ''}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {formatReadableDate(trans.date)} {trans.notes ? `· ${trans.notes}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${
                    trans.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {trans.type === 'income' ? '+' : '-'}{formatCurrency(trans.amount)}
                  </span>
                  
                  <button 
                    onClick={() => {
                      if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
                        deleteTransaction(trans.id);
                      }
                    }}
                    className="p-1 hover:bg-surface-hover text-text-secondary hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-text-muted text-xs">
              Kayıtlı finansal hareket bulunmuyor.
            </div>
          )}
        </div>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <CreditCard className="text-primary w-5 h-5" />
                <span>{transType === 'income' ? 'Ödeme Tahsilatı Gir' : 'Yeni Gider Kaydet'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              {transType === 'income' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ</label>
                  <select 
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">TUTAR</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₺</span>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-surface-card border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">KATEGORİ</label>
                {transType === 'income' ? (
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  >
                    <option value="Ders Ücreti">Ders Ücreti</option>
                    <option value="Kaynak Kitap Satışı">Kaynak Kitap Satışı</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                ) : (
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  >
                    <option value="Ulaşım / Yol">Ulaşım / Yol</option>
                    <option value="Kaynak Kitap">Kaynak Kitap Alımı</option>
                    <option value="Yemek / İçecek">Yemek / İçecek</option>
                    <option value="Kırtasiye">Kırtasiye</option>
                    <option value="Diğer Gider">Diğer</option>
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">AÇIKLAMA / NOT</label>
                <input 
                  type="text"
                  placeholder="İşlem detayı..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
