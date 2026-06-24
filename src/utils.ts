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

export function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(isoString));
  } catch { return isoString; }
}

export function formatMonthYear(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long'
    }).format(new Date(isoString));
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
    const dayNum = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const full = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(date);
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
