export const formatTime12Hour = (time24: string): string => {
  if (!time24) return "--:--";
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  
  // Format to remove leading zeros from hours if desired, or keep standard
  return `${hours}:${minutes}`;
};

export const getArabicDateString = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-TN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};