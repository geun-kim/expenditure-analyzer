export interface Transaction {
  id?: number;
  accountType: string;
  accountNumber: string;
  transactionDate: string;
  chequeNumber?: string;
  description1: string;
  description2: string;
  category?: string;
  cad: number;
  usd: number;
}

export type CategoryUpdate = {
  id: number;
  category: string;
};

export type CategoryKeywords = {
  [category: string]: string[];
};
