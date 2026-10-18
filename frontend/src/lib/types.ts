export interface Transaction {
  /** Booking date as ISO `YYYY-MM-DD`. */
  date: string;
  payee: string;
  purpose: string;
  /** Expense amount in cents, always positive. */
  expenseCents: number;
}

export interface CategorizedTransaction extends Transaction {
  category: string;
}
