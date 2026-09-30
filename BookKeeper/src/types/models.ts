/**
 * Domain models for BookKeeper.
 *
 * The MVP persists everything locally on-device (offline-first) via
 * AsyncStorage — see `src/database`. The shapes below are kept storage-agnostic
 * on purpose so the persistence layer can later be swapped for SQLite/a
 * remote sync backend without touching screens or business logic.
 */

export type ID = string;

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: ID;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: ID;
  type: TransactionType;
  amount: number;
  categoryId: ID;
  note?: string;
  /** Local file URI of an attached receipt photo, if any. */
  photoUri?: string;
  /** ISO date string (yyyy-mm-dd) representing when the money moved. */
  date: string;
  createdAt: string;
}

export type ContactType = 'customer' | 'supplier';

export interface Contact {
  id: ID;
  name: string;
  phone?: string;
  type: ContactType;
}

/**
 * A ledger entry adjusts how much a contact owes (customer) or is owed
 * (supplier). `charge` increases the outstanding balance, `payment`
 * decreases it. This single model works for both receivables and payables.
 */
export type LedgerEntryKind = 'charge' | 'payment';

export interface LedgerEntry {
  id: ID;
  contactId: ID;
  kind: LedgerEntryKind;
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
}

export interface AppSettings {
  currencySymbol: string;
  pinHash: string | null;
  pinEnabled: boolean;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  contacts: Contact[];
  ledgerEntries: LedgerEntry[];
  settings: AppSettings;
}
