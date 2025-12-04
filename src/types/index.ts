export interface Investor {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    national_id?: string;
    notes1?: string;
    notes2?: string;
    notes3?: string;
    joined_at: string;
    total_units: number;
    total_invested_capital: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'PAYOUT';

export interface Transaction {
    id: string;
    investor_id: string;
    type: TransactionType;
    units?: number; // Nullable for PAYOUT
    price_per_unit?: number; // Nullable for PAYOUT
    total_amount: number;
    wac_at_time?: number;
    realized_profit?: number;
    created_at: string;
}

export interface Setting {
    id: number;
    key: string;
    value: number;
    updated_at: string;
};
