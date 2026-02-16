import {
  addDays,
  differenceInHours,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays
} from 'date-fns';

export const formatDate = (value: string | Date, pattern = 'MMM d, yyyy'): string => {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern);
};

export const isDueWithinDays = (dateIso: string, days: number): boolean => {
  const target = parseISO(dateIso);
  const now = new Date();
  const windowEnd = addDays(startOfDay(now), days);
  return (isAfter(target, startOfDay(now)) || isSameDay(target, now)) && isBefore(target, windowEnd);
};

export const isOverdue = (dueDateIso: string): boolean => {
  const dueDate = parseISO(dueDateIso);
  return isBefore(dueDate, startOfDay(new Date()));
};

export const rangeStartDate = (days: number): Date => {
  return startOfDay(subDays(new Date(), days - 1));
};

export const getApprovalHours = (submittedAt: string | null, reviewedAt: string | null): number => {
  if (!submittedAt || !reviewedAt) {
    return 0;
  }

  return Math.max(differenceInHours(parseISO(reviewedAt), parseISO(submittedAt)), 0);
};
