export type Investor = {
    id: string;
    name: string;
    joined_at: string;
    total_units: number;
    total_invested_capital: number;
};

export type TransactionType = 'BUY' | 'SELL';

export type Transaction = {
    id: string;
    investor_id: string;
    type: TransactionType;
    units: number;
    price_per_unit: number;
    total_amount: number;
    wac_at_time?: number;
    realized_profit?: number;
    created_at: string;
};

export type Setting = {
    id: number;
    key: string;
    value: number;
    updated_at: string;
};
