import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Wallet, TrendingDown, History, Phone, Mail, CreditCard, FileText, Banknote } from 'lucide-react';
import { getInvestor, getTransactions, recordDeposit, recordLiquidation, recordPayout } from '../lib/api';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export function InvestorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isLiquidationModalOpen, setIsLiquidationModalOpen] = useState(false);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

    const [depositUnits, setDepositUnits] = useState('');
    const [liquidationUnits, setLiquidationUnits] = useState('');
    const [payoutAmount, setPayoutAmount] = useState('');

    const { data: investor, isLoading: isInvestorLoading } = useQuery({
        queryKey: ['investor', id],
        queryFn: () => getInvestor(id!),
        enabled: !!id,
    });

    const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['transactions', id],
        queryFn: () => getTransactions(id!),
        enabled: !!id,
    });

    const depositMutation = useMutation({
        mutationFn: (units: number) => recordDeposit(id!, units),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investor', id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', id] });
            setIsDepositModalOpen(false);
            setDepositUnits('');
        },
    });

    const liquidationMutation = useMutation({
        mutationFn: (units: number) => recordLiquidation(id!, units),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investor', id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', id] });
            setIsLiquidationModalOpen(false);
            setLiquidationUnits('');
        },
    });

    const payoutMutation = useMutation({
        mutationFn: (amount: number) => recordPayout(id!, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', id] });
            setIsPayoutModalOpen(false);
            setPayoutAmount('');
        },
    });

    if (isInvestorLoading || isTransactionsLoading) return <div className="text-center p-8">جاري التحميل...</div>;
    if (!investor) return <div className="text-center p-8">المستثمر غير موجود</div>;

    const wac = investor.total_units > 0
        ? investor.total_invested_capital / investor.total_units
        : 0;

    // Calculate totals from transactions
    const totalPayouts = transactions
        ?.filter(t => t.type === 'PAYOUT')
        .reduce((sum, t) => sum + t.total_amount, 0) || 0;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/investors')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 ml-2" />
                العودة للقائمة
            </button>

            {/* Header & Profile Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{investor.name}</h1>
                        <p className="text-gray-500">
                            تاريخ الانضمام: {format(new Date(investor.joined_at), 'PPP', { locale: arSA })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsDepositModalOpen(true)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
                        >
                            <Wallet className="w-4 h-4" />
                            <span>إيداع (شراء)</span>
                        </button>
                        <button
                            onClick={() => setIsLiquidationModalOpen(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                        >
                            <TrendingDown className="w-4 h-4" />
                            <span>تسييل (بيع)</span>
                        </button>
                        <button
                            onClick={() => setIsPayoutModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        >
                            <Banknote className="w-4 h-4" />
                            <span>توزيع أرباح</span>
                        </button>
                    </div>
                </div>

                {/* Contact & Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
                    {investor.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{investor.phone}</span>
                        </div>
                    )}
                    {investor.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{investor.email}</span>
                        </div>
                    )}
                    {investor.national_id && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>الرقم المدني: {investor.national_id}</span>
                        </div>
                    )}
                </div>

                {(investor.notes1 || investor.notes2 || investor.notes3) && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4" />
                            <span>ملاحظات:</span>
                        </div>
                        {investor.notes1 && <p className="text-sm text-gray-600">• {investor.notes1}</p>}
                        {investor.notes2 && <p className="text-sm text-gray-600">• {investor.notes2}</p>}
                        {investor.notes3 && <p className="text-sm text-gray-600">• {investor.notes3}</p>}
                    </div>
                )}
            </div>

            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-1">عدد الوحدات المملوكة</h3>
                    <p className="text-2xl font-bold text-gray-900">{investor.total_units.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-1">إجمالي رأس المال المستثمر</h3>
                    <p className="text-2xl font-bold text-emerald-600">{investor.total_invested_capital.toLocaleString()} د.ك</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-1">متوسط التكلفة المرجح (WAC)</h3>
                    <p className="text-2xl font-bold text-blue-600">{wac.toFixed(2)} د.ك</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-1">إجمالي الأرباح الموزعة</h3>
                    <p className="text-2xl font-bold text-purple-600">{totalPayouts.toLocaleString()} د.ك</p>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">سجل العمليات</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نوع العملية</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">عدد الوحدات</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">سعر الوحدة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجمالي</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الربح المحقق</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions?.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {format(new Date(tx.created_at), 'PP p', { locale: arSA })}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'BUY'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : tx.type === 'SELL'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {tx.type === 'BUY' ? 'شراء (إيداع)' : tx.type === 'SELL' ? 'بيع (تسييل)' : 'توزيع أرباح'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {tx.units ? tx.units.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {tx.price_per_unit ? `${tx.price_per_unit.toLocaleString()} د.ك` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {tx.total_amount.toLocaleString()} د.ك
                                    </td>
                                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">
                                        {tx.realized_profit ? `+${tx.realized_profit.toLocaleString()} د.ك` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {transactions?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        لا توجد عمليات مسجلة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {isDepositModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">تسجيل إيداع جديد</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            depositMutation.mutate(Number(depositUnits));
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الوحدات</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={depositUnits}
                                    onChange={(e) => setDepositUnits(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsDepositModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={depositMutation.isPending}
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                                >
                                    {depositMutation.isPending ? 'جاري التسجيل...' : 'تأكيد الإيداع'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isLiquidationModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">تسجيل تسييل (بيع)</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            liquidationMutation.mutate(Number(liquidationUnits));
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الوحدات المباعة</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={investor.total_units}
                                    value={liquidationUnits}
                                    onChange={(e) => setLiquidationUnits(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">المتاح: {investor.total_units}</p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsLiquidationModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={liquidationMutation.isPending}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    {liquidationMutation.isPending ? 'جاري التسجيل...' : 'تأكيد البيع'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPayoutModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">تسجيل توزيع أرباح</h2>
                        <p className="text-gray-500 mb-4 text-sm">
                            هذا المبلغ سيتم تسجيله كأرباح موزعة للمستثمر ولن يؤثر على عدد الوحدات أو رأس المال المستثمر.
                        </p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            payoutMutation.mutate(Number(payoutAmount));
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ك)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsPayoutModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={payoutMutation.isPending}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    {payoutMutation.isPending ? 'جاري التسجيل...' : 'تأكيد التوزيع'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
