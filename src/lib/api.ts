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

export async function createInvestor(name: string): Promise<Investor> {
    const { data, error } = await supabase
        .from('investors')
        .insert([{ name }])
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
export async function getTransactions(investorId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('investor_id', investorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function recordDeposit(investorId: string, units: number, pricePerUnit: number): Promise<void> {
    const totalAmount = units * pricePerUnit;

    // 1. Get current investor state
    const investor = await getInvestor(investorId);

    // 2. Calculate new totals
    const newTotalUnits = investor.total_units + units;
    const newTotalCapital = investor.total_invested_capital + totalAmount;

    // 3. Update investor
    const { error: updateError } = await supabase
        .from('investors')
        .update({
            total_units: newTotalUnits,
            total_invested_capital: newTotalCapital,
        })
        .eq('id', investorId);

    if (updateError) throw updateError;

    // 4. Create transaction record
    const { error: txError } = await supabase
        .from('transactions')
        .insert([{
            investor_id: investorId,
            type: 'BUY',
            units: units,
            price_per_unit: pricePerUnit,
            total_amount: totalAmount,
        }]);

    if (txError) throw txError;
}

export async function recordLiquidation(investorId: string, unitsToSell: number, currentPrice: number): Promise<void> {
    // 1. Get current investor state
    const investor = await getInvestor(investorId);

    if (investor.total_units < unitsToSell) {
        throw new Error('Insufficient units');
    }

    // 2. Calculate WAC and Profit
    // WAC = Total Invested / Total Units
    const wac = investor.total_units > 0
        ? investor.total_invested_capital / investor.total_units
        : 0;

    const revenue = unitsToSell * currentPrice;
    const cogs = unitsToSell * wac; // Cost of Goods Sold based on WAC
    const profit = revenue - cogs;

    // 3. Calculate new totals
    const newTotalUnits = investor.total_units - unitsToSell;
    // Reduce capital by the COGS (removing the cost basis of the sold units)
    const newTotalCapital = investor.total_invested_capital - cogs;

    // 4. Update investor
    const { error: updateError } = await supabase
        .from('investors')
        .update({
            total_units: newTotalUnits,
            total_invested_capital: newTotalCapital,
        })
        .eq('id', investorId);

    if (updateError) throw updateError;

    // 5. Create transaction record
    const { error: txError } = await supabase
        .from('transactions')
        .insert([{
            investor_id: investorId,
            type: 'SELL',
            units: unitsToSell,
            price_per_unit: currentPrice,
            total_amount: revenue,
            wac_at_time: wac,
            realized_profit: profit,
        }]);

    if (txError) throw txError;
}
