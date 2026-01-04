const CONTACTS_KEY = 'contacts_map';

export interface ContactEntry {
  username: string;
  userId: number;
}

const readContacts = (): Record<string, number> => {
  const raw = localStorage.getItem(CONTACTS_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
};

const writeContacts = (data: Record<string, number>) => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(data));
};

export const addContact = (entry: ContactEntry) => {
  const contacts = readContacts();
  contacts[entry.username.toLowerCase()] = entry.userId;
  writeContacts(contacts);
};

export const removeContact = (username: string) => {
  const contacts = readContacts();
  delete contacts[username.toLowerCase()];
  writeContacts(contacts);
};

export const getContactId = (username: string): number | null => {
  const contacts = readContacts();
  return contacts[username.toLowerCase()] ?? null;
};

export const listContacts = (): ContactEntry[] => {
  const contacts = readContacts();
  return Object.entries(contacts).map(([username, userId]) => ({
    username,
    userId,
  }));
};
