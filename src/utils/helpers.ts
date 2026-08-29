/**
 * Formats a phone number for WhatsApp web integration.
 * Removes spaces, dashes, parentheses and adds country code if missing.
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0 and is 11 digits, replace 0 with 90 (Turkey country code)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '90' + cleaned.substring(1);
  }
  
  // If it is 10 digits (without country code or 0), prepend 90
  if (cleaned.length === 10) {
    cleaned = '90' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generates a WhatsApp deep link template.
 */
export function getWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Formats standard number amounts into Turkish Lira currency format.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('TRY', '₺').trim();
}

/**
 * Returns Turkish translation of standard classes / grade strings.
 */
export function getGradeLabel(grade: string): string {
  return normalizeGrade(grade);
}

export function normalizeGrade(g?: string | null): string {
  if (!g) return '12. Sınıf (YKS)';
  const str = g.trim();
  if (str.startsWith('5')) return '5. Sınıf';
  if (str.startsWith('6')) return '6. Sınıf';
  if (str.startsWith('7')) return '7. Sınıf';
  if (str.startsWith('8')) return '8. Sınıf (LGS)';
  if (str.startsWith('9')) return '9. Sınıf';
  if (str.startsWith('10')) return '10. Sınıf';
  if (str.startsWith('11')) return '11. Sınıf';
  if (str.startsWith('12')) return '12. Sınıf (YKS)';
  if (str.toLowerCase().includes('mezun')) return 'Mezun (YKS)';
  return str;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time (prevents UTC timezone shift lag).
 */
export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Formats a Date object to YYYY-MM-DD string in local time.
 */
export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to readable Turkish format, e.g., "15 Temmuz Çarşamba"
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const cleanStr = dateString.split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
}

/**
 * Format date/time into WhatsApp templates.
 */
export function getHomeworkTemplate(studentName: string, homeworkTitle: string, dueDate: string, dueTime: string, teacherName: string): string {
  const formattedDate = formatReadableDate(dueDate);
  return `Yeni Bir Ödevin Var!

Merhaba ${studentName}, ${formattedDate} saat ${dueTime} tarihine kadar tamamlaman gereken yeni bir ödevin var.

• Ödevin: ${homeworkTitle}

Ödevi sistemden görüntüleyip tamamlayabilirsin.

${teacherName} Hoca
Görüşmek üzere 👋`;
}

export function getLessonReminderTemplate(studentName: string, dateStr: string, timeStr: string, teacherName: string): string {
  const formattedDate = formatReadableDate(dateStr);
  return `Ders Hatırlatması 📚

Merhaba ${studentName}, ${formattedDate} günü saat ${timeStr}'da planlanmış olan özel dersimizi hatırlatmak istedim. Derse hazırlıklı gelmeyi unutma.

Görüşmek üzere, iyi çalışmalar!

${teacherName} Hoca`;
}

/**
 * Simple salt & hash helper for passwords using SHA-256.
 * Fallback to base64 encoding if crypto.subtle is unavailable.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const trimmed = password.trim();
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(`coach_salt_2026_${trimmed}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return 'b64_' + btoa(`coach_salt_2026_${trimmed}`);
}

/**
 * Verifies an input password against stored hash or legacy plain passwords.
 */
export async function verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  if (!inputPassword || !storedHash) return false;
  const cleanInput = inputPassword.trim();
  
  // Exact match with plain stored password
  if (storedHash === cleanInput) return true;
  
  // Admin fallback matching
  if ((cleanInput === 'admin123' || cleanInput === '123456') && (storedHash === 'admin123' || storedHash === '123456')) return true;

  const hashedInput = await hashPassword(cleanInput);
  return hashedInput === storedHash;
}
