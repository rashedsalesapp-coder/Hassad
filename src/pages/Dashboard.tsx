import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Coins, TrendingUp, Edit2, Check, X, Banknote, ArrowUpRight } from 'lucide-react';
import { getInvestors, getCurrentUnitPrice, updateUnitPrice, getAllPayouts, getTotalCapitalReturned } from '../lib/api';

export function Dashboard() {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [newPrice, setNewPrice] = useState('');
    const queryClient = useQueryClient();

    const { data: investors } = useQuery({
        queryKey: ['investors'],
        queryFn: getInvestors,
    });

    const { data: currentPrice } = useQuery({
        queryKey: ['currentPrice'],
        queryFn: getCurrentUnitPrice,
    });

    const { data: totalPayouts } = useQuery({
        queryKey: ['totalPayouts'],
        queryFn: getAllPayouts,
    });

    const { data: totalCapitalReturned } = useQuery({
        queryKey: ['totalCapitalReturned'],
        queryFn: getTotalCapitalReturned,
    });

    const updatePriceMutation = useMutation({
        mutationFn: updateUnitPrice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentPrice'] });
            setIsEditingPrice(false);
        },
    });

    const handleUpdatePrice = () => {
        if (newPrice) {
            updatePriceMutation.mutate(Number(newPrice));
        }
    };

    const totalInvestedCapital = investors?.reduce(
        (sum, inv) => sum + Number(inv.total_invested_capital),
        0
    ) || 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Current Unit Price Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        {!isEditingPrice ? (
                            <button
                                onClick={() => {
                                    setNewPrice(currentPrice?.toString() || '');
                                    setIsEditingPrice(true);
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdatePrice}
                                    className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsEditingPrice(false)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">سعر الوحدة الحالي</h3>
                    {isEditingPrice ? (
                        <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                            autoFocus
                        />
                    ) : (
                        <p className="text-2xl font-bold text-gray-900">{currentPrice?.toLocaleString()} د.ك</p>
                    )}
                </div>

                {/* Total Investors Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">إجمالي المستثمرين</h3>
                    <p className="text-2xl font-bold text-gray-900">{investors?.length || 0}</p>
                </div>

                {/* Total Invested Capital Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Coins className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">إجمالي رأس المال المستثمر</h3>
                    <p className="text-2xl font-bold text-gray-900">{totalInvestedCapital.toLocaleString()} د.ك</p>
                </div>

                {/* Total Distributed Profits Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-100 p-3 rounded-lg">
                            <Banknote className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">إجمالي الأرباح الموزعة</h3>
                    <p className="text-2xl font-bold text-gray-900">{totalPayouts?.toLocaleString() || 0} د.ك</p>
                </div>

                {/* Total Capital Returned Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-100 p-3 rounded-lg">
                            <ArrowUpRight className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">إجمالي المبالغ المستردة</h3>
                    <p className="text-2xl font-bold text-gray-900">{totalCapitalReturned?.toLocaleString() || 0} د.ك</p>
                    <p className="text-xs text-gray-400 mt-1">(شامل التسييل والأرباح)</p>
                </div>

            </div>
        </div>
    );
}
