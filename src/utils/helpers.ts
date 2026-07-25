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
  return grade;
}

/**
 * Format date to readable Turkish format, e.g., "15 Temmuz Çarşamba"
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    weekday: 'long'
  };
  return date.toLocaleDateString('tr-TR', options);
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
