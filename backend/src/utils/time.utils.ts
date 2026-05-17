// Türkiye saat dilimi (UTC+3)
const TURKEY_TIMEZONE_OFFSET = 3;

/**
 * Belirtilen tarihe, saate göre Türkiye'de o zamanın kaç dakika sonra olduğunu döner
 * Negatif değer = zaman geçmiş
 * Pozitif değer = zaman henüz gelmedi (kaç dakika sonra)
 */
export function getMinutesUntilExamStart(examDate: string, examTime: string): number {
  // Tarih ve saat formatı: "2026-05-15" ve "16:30:00"
  // NOT: Veritabanında kaydedilen saatler zaten Türkiye saati (UTC+3)
  const [year, month, day] = examDate.split('-').map(Number);
  const [hours, minutes, seconds] = examTime.split(':').map(Number);

  // Veritabanında kaydedilen saat Türkiye saati olduğundan, bunu UTC'ye çevir
  // Türkiye saat = UTC + 3 saat, dolayısıyla UTC = Türkiye saat - 3 saat
  const examDateTime = new Date(Date.UTC(year, month - 1, day, hours - TURKEY_TIMEZONE_OFFSET, minutes, seconds));

  // Şu anın UTC'si
  const now = new Date();

  // Fark (milisaniye)
  const diffMs = examDateTime.getTime() - now.getTime();

  // Dakikaya çevir
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Sınav zamanı geçmiş mi? (Türkiye saati ile)
 */
export function hasExamStarted(examDate: string, examTime: string): boolean {
  return getMinutesUntilExamStart(examDate, examTime) <= 0;
}

/**
 * Sınav zamanı geçmedi, henüz başlamadı mı?
 */
export function hasExamNotStarted(examDate: string, examTime: string): boolean {
  return getMinutesUntilExamStart(examDate, examTime) > 0;
}

/**
 * Sınav hala devam ediyor mu? (başlangıç zamanı + süre)
 */
export function isExamStillActive(examDate: string, examTime: string, durationMinutes: number): boolean {
  const minutesUntilStart = getMinutesUntilExamStart(examDate, examTime);
  // Başladı (-) ve henüz bitmedi (süre içinde)
  return minutesUntilStart <= 0 && minutesUntilStart > -durationMinutes;
}

/**
 * Sınav süresi içinde kalan dakika sayısını döner
 * Negatif = sınav bitti
 * Pozitif = sınav devam ediyor
 */
export function getRemainingExamMinutes(examDate: string, examTime: string, durationMinutes: number): number {
  const minutesUntilStart = getMinutesUntilExamStart(examDate, examTime);
  const endTime = minutesUntilStart + durationMinutes;
  return endTime;
}

/**
 * Sınav süresi dolmuş mu? (başlangıç + süre geçmiş mi?)
 * true = sınav süresi bitti, completed olması gereken sınav
 * false = sınav hala aktif veya henüz başlamadı
 */
export function hasExamExpired(examDate: string, examTime: string, durationMinutes: number): boolean {
  const remainingMinutes = getRemainingExamMinutes(examDate, examTime, durationMinutes);
  return remainingMinutes < 0;
}


/**
 * ISO formatında Türkiye saati
 */
export function getTurkeyTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + TURKEY_TIMEZONE_OFFSET * 60 * 60 * 1000);
}
