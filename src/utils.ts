export interface ParsedSMS {
  amount: number;
  type: 'income' | 'expense';
  bankName: string;
  cardSuffix: string;
  balance?: number;
}

export function formatCurrency(amount: number, omitSuffix?: boolean): string {
  const isNegative = amount < 0;
  const formatted = Math.abs(amount).toLocaleString('fa-IR');
  return (isNegative ? '\u202A-\u202C' : '') + formatted + (omitSuffix ? '' : ' تومان');
}

export const SHAMSI_MONTH_NAMES = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const s = gregorianToShamsi(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${s.day} ${SHAMSI_MONTH_NAMES[s.month - 1]} ${s.year}`;
  } catch { return isoString; }
}

export function formatMonthYear(isoString: string): string {
  try {
    const d = new Date(isoString);
    const s = gregorianToShamsi(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${SHAMSI_MONTH_NAMES[s.month - 1]} ${s.year}`;
  } catch { return isoString; }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function parseBankSMS(text: string): ParsedSMS | null {
  if (!text) return null;

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let cleanText = text;

  for (let i = 0; i < 10; i++) {
    cleanText = cleanText.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    cleanText = cleanText.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }

  let bankName = 'بانک نامشخص';
  const bankPatterns: { name: string; regex: RegExp }[] = [
    { name: 'بلوبانک', regex: /(بلو|blue|blubank|بلو بانک)/i },
    { name: 'بانک ملت', regex: /(ملت|mellat)/i },
    { name: 'بانک ملی', regex: /(ملی|melli)/i },
    { name: 'بانک سامان', regex: /(سامان|saman)/i },
    { name: 'بانک پاسارگاد', regex: /(پاسارگاد|pasargad)/i },
    { name: 'بانک تجارت', regex: /(تجارت|tejarat)/i },
    { name: 'بانک صادرات', regex: /(صادرات|saderat)/i },
    { name: 'بانک سپه', regex: /(سپه|sepah)/i },
    { name: 'بانک رسالت', regex: /(رسالت|resalat)/i },
    { name: 'بانک مهر ایران', regex: /(مهر ایران|mehr)/i },
    { name: 'بانک پارسیان', regex: /(پارسیان|parsian)/i },
    { name: 'بانک مسکن', regex: /(مسکن|maskan)/i },
    { name: 'بانک آینده', regex: /(آینده|ayandeh)/i },
    { name: 'بانک شهر', regex: /(شهر|shahr)/i },
  ];

  for (const pattern of bankPatterns) {
    if (pattern.regex.test(cleanText)) {
      bankName = pattern.name;
      break;
    }
  }

  let type: 'income' | 'expense' = 'expense';
  const incomeKeywords = ['واریز', 'انتقال به', 'اضافه', 'افزایش', '+', 'دریافت', 'کارت به کارت به'];
  const expenseKeywords = ['برداشت', 'خرید', 'انتقال از', 'پرداخت', 'کاهش', 'قبض', 'کارتخوان', 'خودپرداز', '-', 'کارت به کارت از', 'کسر'];

  let incomeScore = 0;
  let expenseScore = 0;
  for (const kw of incomeKeywords) if (cleanText.includes(kw)) incomeScore += 2;
  for (const kw of expenseKeywords) if (cleanText.includes(kw)) expenseScore += 2;
  if (incomeScore > expenseScore) type = 'income';

  let cardSuffix = '';
  const cardRegex = /(?:کارت|حساب|به کارت|از کارت|به حساب|از حساب)[^\d]*(\d{4,16})/;
  const cardMatch = cleanText.match(cardRegex);
  if (cardMatch) {
    cardSuffix = cardMatch[1].slice(-4);
  } else {
    const suffixMatch = cleanText.match(/(?:\.\.\.|\*|حساب|کارت)(\d{4})/);
    if (suffixMatch) cardSuffix = suffixMatch[1];
  }

  let balance: number | undefined;
  const balanceRegex = /(?:مانده|موجودی|باقیمانده|موجودی جدید)[^\d]*(\d[\d,]*\d)/;
  const balanceMatch = cleanText.match(balanceRegex);
  if (balanceMatch) {
    const balVal = parseInt(balanceMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(balVal)) {
      balance = cleanText.includes('ریال') && !cleanText.includes('تومان')
        ? Math.floor(balVal / 10) : balVal;
    }
  }

  let amount = 0;
  const amtRegexes = [
    /(?:مبلغ|واریز|برداشت|خرید|پرداخت|انتقال)[^\d]*(\d[\d,]*\d)/,
    /(\d[\d,]*\d)\s*(?:ریال|تومان)/
  ];

  let amtMatch: RegExpMatchArray | null = null;
  for (const regex of amtRegexes) {
    amtMatch = cleanText.match(regex);
    if (amtMatch) break;
  }

  if (amtMatch) {
    amount = parseInt(amtMatch[1].replace(/,/g, ''), 10);
  } else {
    const numbers = cleanText.match(/\b\d[\d,]*\d\b/g);
    if (numbers) {
      const cleanNumbers = numbers
        .map(n => n.replace(/,/g, ''))
        .filter(n => n.length >= 4 && n.length <= 11)
        .map(n => parseInt(n, 10));
      if (cleanNumbers.length > 0) amount = Math.max(...cleanNumbers);
    }
  }

  if (cleanText.includes('ریال') && !cleanText.includes('تومان')) {
    amount = Math.floor(amount / 10);
  }

  return amount > 0 ? { amount, type, bankName, cardSuffix, balance } : null;
}

export function getPersianDate(date: Date = new Date()): { dayName: string; dayNum: string; month: string; full: string } {
  try {
    const dayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);
    const s = gregorianToShamsi(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const dayNum = s.day.toLocaleString('fa-IR');
    const month = SHAMSI_MONTH_NAMES[s.month - 1];
    const full = `${s.day} ${month} ${s.year}`;
    return { dayName, dayNum, month, full };
  } catch {
    return { dayName: '', dayNum: String(date.getDate()), month: '', full: '' };
  }
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

export function generateLast14Days(): Date[] {
  return Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });
}

export function gregorianToShamsi(gy: number, gm: number, gd: number): { year: number; month: number; day: number } {
  const g_days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const days = 355666 + (365 * gy) + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd + g_days[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  let rem = days % 12053;
  jy += 33 * Math.floor(rem / 366);
  rem %= 366;
  if (rem >= 366) { jy += Math.floor((rem - 366) / 365); rem = (rem - 366) % 365; }
  let jm = 1, jd = rem;
  if (rem < 186) { jm = 1 + Math.floor(rem / 31); jd = rem % 31; }
  else { rem -= 186; if (rem < 150) { jm = 7 + Math.floor(rem / 30); jd = rem % 30; } else { jm = 12; jd = rem - 150; } }
  return { year: jy, month: jm, day: jd + 1 };
}

export function shamsiToGregorian(sy: number, sm: number, sd: number): Date {
  const gy = sy + 621;
  let jd = sd - 1;
  if (sm <= 6) jd += (sm - 1) * 31;
  else jd += 186 + (sm - 7) * 30;
  const test = new Date(gy, 2, 21);
  test.setDate(test.getDate() + jd);
  const back = gregorianToShamsi(test.getFullYear(), test.getMonth() + 1, test.getDate());
  if (back.year !== sy) {
    const adjust = sy < back.year ? -1 : 1;
    const test2 = new Date(gy + adjust, 2, 21);
    test2.setDate(test2.getDate() + jd);
    return test2;
  }
  return test;
}

export function formatShamsiDate(date: Date): string {
  const s = gregorianToShamsi(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${s.year}/${String(s.month).padStart(2, '0')}/${String(s.day).padStart(2, '0')}`;
}

export function formatShortMonth(date: Date): string {
  try {
    const s = gregorianToShamsi(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return s.month <= 6 ? `${s.month} ماهه` : SHAMSI_MONTH_NAMES[s.month - 1].substring(0, 4);
  } catch { return ''; }
}

export function parseDateFromInput(input: string): Date | null {
  const parts = input.split('/');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(p => parseInt(p, 10));
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return shamsiToGregorian(y, m, d);
}
