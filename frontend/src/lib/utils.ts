import clsx from 'clsx';

export const cn = (...inputs: Array<string | false | null | undefined>) => {
  return clsx(inputs);
};

export const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const parseUserIds = (input: string): number[] => {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((item) => parseInt(item.trim(), 10))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
};
