import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUnitPrice, updateUnitPrice, getInvestors } from '../lib/api';
import { useState } from 'react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export function Dashboard() {
    const queryClient = useQueryClient();
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [newPrice, setNewPrice] = useState('');

    const { data: currentPrice, isLoading: isLoadingPrice } = useQuery({
        queryKey: ['currentUnitPrice'],
        queryFn: getCurrentUnitPrice,
    });

    const { data: investors, isLoading: isLoadingInvestors } = useQuery({
        queryKey: ['investors'],
        queryFn: getInvestors,
    });

    const updatePriceMutation = useMutation({
        mutationFn: updateUnitPrice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUnitPrice'] });
            setIsEditingPrice(false);
            setNewPrice('');
        },
    });

    const handleUpdatePrice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPrice) return;
        updatePriceMutation.mutate(parseFloat(newPrice));
    };

    const totalCapital = investors?.reduce((sum, inv) => sum + inv.total_invested_capital, 0) || 0;

    if (isLoadingPrice || isLoadingInvestors) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Current Unit Price Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="mr-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">سعر الوحدة الحالي</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {currentPrice?.toLocaleString()} دينار
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        {isEditingPrice ? (
                            <form onSubmit={handleUpdatePrice} className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder="السعر الجديد"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                />
                                <button
                                    type="submit"
                                    disabled={updatePriceMutation.isPending}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPrice(false)}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    إلغاء
                                </button>
                            </form>
                        ) : (
                            <div className="text-sm">
                                <button
                                    onClick={() => setIsEditingPrice(true)}
                                    className="font-medium text-emerald-600 hover:text-emerald-500"
                                >
                                    تحديث السعر
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Investors Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="mr-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">عدد المستثمرين</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{investors?.length}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Fund Value Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="mr-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">إجمالي رأس المال المستثمر</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {totalCapital.toLocaleString()} دينار
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
