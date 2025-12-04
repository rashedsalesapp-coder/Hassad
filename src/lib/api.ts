import { supabase } from './supabase';
import type { Investor, Transaction } from '../types';

// Settings
export async function getCurrentUnitPrice(): Promise<number> {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'current_unit_price')
        .single();

    if (error) throw error;
    return data?.value || 100;
}

export async function updateUnitPrice(newPrice: number): Promise<void> {
    const { error } = await supabase
        .from('settings')
        .update({ value: newPrice, updated_at: new Date().toISOString() })
        .eq('key', 'current_unit_price');

    if (error) throw error;
}

// Investors
export async function getInvestors(): Promise<Investor[]> {
    const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('joined_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createInvestor(investor: Omit<Investor, 'id' | 'joined_at' | 'total_units' | 'total_invested_capital'>) {
    const { data, error } = await supabase
        .from('investors')
        .insert([
            {
                name: investor.name,
                phone: investor.phone,
                email: investor.email,
                national_id: investor.national_id,
                notes1: investor.notes1,
                notes2: investor.notes2,
                notes3: investor.notes3,
                total_units: 0,
                total_invested_capital: 0
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getInvestor(id: string): Promise<Investor> {
    const { data, error } = await supabase
        .from('investors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

// Transactions
export async function getTransactions(investorId: string) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('investor_id', investorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
}

export async function recordDeposit(investorId: string, units: number) {
    // 1. Get current unit price
    const currentPrice = await getCurrentUnitPrice();

    // 2. Get investor details
    const investor = await getInvestor(investorId);
    if (!investor) throw new Error('Investor not found');

    const totalAmount = units * currentPrice;

    // 3. Update investor totals
    // New Total Capital = Old Capital + (Units * Current Price)
    const newTotalCapital = Number(investor.total_invested_capital) + totalAmount;
    const newTotalUnits = Number(investor.total_units) + units;

    const { error: updateError } = await supabase
        .from('investors')
        .update({
            total_units: newTotalUnits,
            total_invested_capital: newTotalCapital
        })
        .eq('id', investorId);

    if (updateError) throw updateError;

    // 4. Record Transaction
    const { error: txError } = await supabase
        .from('transactions')
        .insert([
            {
                investor_id: investorId,
                type: 'BUY',
                units: units,
                price_per_unit: currentPrice,
                total_amount: totalAmount
            }
        ]);

    if (txError) throw txError;
}

export async function recordLiquidation(investorId: string, unitsToSell: number) {
    // 1. Get current unit price (Liquidation Price)
    const currentPrice = await getCurrentUnitPrice();

    // 2. Get investor details
    const investor = await getInvestor(investorId);
    if (!investor) throw new Error('Investor not found');

    if (unitsToSell > investor.total_units) {
        throw new Error('Insufficient units');
    }

    // 3. Calculate WAC
    // WAC = Total Invested Capital / Total Units
    const wac = investor.total_units > 0
        ? investor.total_invested_capital / investor.total_units
        : 0;

    // 4. Calculate Financials
    const revenue = unitsToSell * currentPrice;
    const cogs = unitsToSell * wac; // Cost of Goods Sold
    const realizedProfit = revenue - cogs;

    // 5. Update Investor Totals
    // We reduce the invested capital by the COGS to maintain the WAC for remaining units
    const newTotalCapital = Number(investor.total_invested_capital) - cogs;
    const newTotalUnits = Number(investor.total_units) - unitsToSell;

    const { error: updateError } = await supabase
        .from('investors')
        .update({
            total_units: newTotalUnits,
            total_invested_capital: newTotalCapital
        })
        .eq('id', investorId);

    if (updateError) throw updateError;

    // 6. Record Transaction
    const { error: txError } = await supabase
        .from('transactions')
        .insert([
            {
                investor_id: investorId,
                type: 'SELL',
                units: unitsToSell,
                price_per_unit: currentPrice,
                total_amount: revenue,
                wac_at_time: wac,
                realized_profit: realizedProfit
            }
        ]);

    if (txError) throw txError;
}

export async function recordPayout(investorId: string, amount: number) {
    // Record a profit distribution (Payout)
    // This does NOT affect units or invested capital, it's just a record of money paid out

    const { error } = await supabase
        .from('transactions')
        .insert([
            {
                investor_id: investorId,
                type: 'PAYOUT',
                total_amount: amount,
                // units and price_per_unit are null for payouts
            }
        ]);

    if (error) throw error;
}

export async function getAllPayouts() {
    const { data, error } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('type', 'PAYOUT');

    if (error) throw error;
    return data.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
}

export async function getTotalCapitalReturned() {
    const { data, error } = await supabase
        .from('transactions')
        .select('total_amount, type')
        .in('type', ['SELL', 'PAYOUT']);

    if (error) throw error;
    return data.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
}
