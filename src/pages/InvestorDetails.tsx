import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvestor, getTransactions, getCurrentUnitPrice, recordDeposit, recordLiquidation } from '../lib/api';
import { ArrowLeft, Plus, Minus, History } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function InvestorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isLiquidationModalOpen, setIsLiquidationModalOpen] = useState(false);

    // Form states
    const [units, setUnits] = useState('');
    const [error, setError] = useState('');

    const { data: investor, isLoading: isLoadingInvestor } = useQuery({
        queryKey: ['investor', id],
        queryFn: () => getInvestor(id!),
        enabled: !!id,
    });

    const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ['transactions', id],
        queryFn: () => getTransactions(id!),
        enabled: !!id,
    });

    const { data: currentPrice } = useQuery({
        queryKey: ['currentUnitPrice'],
        queryFn: getCurrentUnitPrice,
    });

    const depositMutation = useMutation({
        mutationFn: async () => {
            if (!id || !currentPrice) return;
            await recordDeposit(id, parseFloat(units), currentPrice);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investor', id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', id] });
            setIsDepositModalOpen(false);
            setUnits('');
            setError('');
        },
        onError: (err) => setError(err.message),
    });

    const liquidationMutation = useMutation({
        mutationFn: async () => {
            if (!id || !currentPrice) return;
            await recordLiquidation(id, parseFloat(units), currentPrice);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investor', id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', id] });
            setIsLiquidationModalOpen(false);
            setUnits('');
            setError('');
        },
        onError: (err) => setError(err.message),
    });

    if (isLoadingInvestor || isLoadingTransactions) return <div className="text-center py-10">جاري التحميل...</div>;
    if (!investor) return <div className="text-center py-10">المستثمر غير موجود</div>;

    const wac = investor.total_units > 0 ? investor.total_invested_capital / investor.total_units : 0;
    const currentValue = investor.total_units * (currentPrice || 0);
    const unrealizedProfit = currentValue - investor.total_invested_capital;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/investors')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft className="h-4 w-4 ml-1" />
                عودة لقائمة المستثمرين
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{investor.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">تفاصيل المحفظة الاستثمارية</p>
                    </div>
                    <div className="flex space-x-3 space-x-reverse">
                        <button
                            onClick={() => setIsDepositModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4 ml-2" />
                            إيداع (شراء)
                        </button>
                        <button
                            onClick={() => setIsLiquidationModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                            <Minus className="h-4 w-4 ml-2" />
                            تسييل (بيع)
                        </button>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">عدد الوحدات المملوكة</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                                {investor.total_units} وحدة
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">إجمالي رأس المال المستثمر (Cost Basis)</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {investor.total_invested_capital.toLocaleString()} دينار
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                            <dt className="text-sm font-medium text-gray-500">متوسط التكلفة المرجح (WAC)</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold text-emerald-700">
                                {wac.toFixed(2)} دينار / وحدة
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">القيمة السوقية الحالية</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {currentValue.toLocaleString()} دينار
                                <span className={`mr-2 text-xs ${unrealizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({unrealizedProfit >= 0 ? '+' : ''}{unrealizedProfit.toLocaleString()} ربح غير محقق)
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <History className="h-5 w-5 ml-2 text-gray-400" />
                        سجل المعاملات
                    </h3>
                </div>
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                التاريخ
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                النوع
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الوحدات
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                السعر / وحدة
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الإجمالي
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الربح المحقق
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions?.map((tx) => (
                                            <tr key={tx.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(tx.created_at), 'dd MMMM yyyy', { locale: ar })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {tx.type === 'BUY' ? 'شراء' : 'بيع'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {tx.units}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tx.price_per_unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {tx.total_amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tx.realized_profit ? (
                                                        <span className="text-green-600 font-bold">
                                                            +{tx.realized_profit.toLocaleString()}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {isDepositModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <Plus className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">إيداع جديد (شراء وحدات)</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            سعر الوحدة الحالي: <span className="font-bold text-gray-900">{currentPrice} دينار</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الوحدات</label>
                                <input
                                    type="number"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                    placeholder="0"
                                />
                                {units && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        الإجمالي: <span className="font-bold">{(parseFloat(units) * (currentPrice || 0)).toLocaleString()} دينار</span>
                                    </p>
                                )}
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    onClick={() => depositMutation.mutate()}
                                    disabled={!units || depositMutation.isPending}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:col-start-2 sm:text-sm"
                                >
                                    تأكيد الشراء
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsDepositModalOpen(false); setUnits(''); setError(''); }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Liquidation Modal */}
            {isLiquidationModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <Minus className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">تسييل (بيع وحدات)</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            سعر التسييل الحالي: <span className="font-bold text-gray-900">{currentPrice} دينار</span>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            متوسط التكلفة (WAC): <span className="font-bold text-gray-900">{wac.toFixed(2)} دينار</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الوحدات للبيع</label>
                                <input
                                    type="number"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                    placeholder="0"
                                    max={investor.total_units}
                                />
                                {units && (
                                    <div className="mt-2 bg-gray-50 p-2 rounded">
                                        <p className="text-sm text-gray-700">
                                            قيمة البيع: <span className="font-bold">{(parseFloat(units) * (currentPrice || 0)).toLocaleString()}</span>
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            التكلفة (WAC): <span className="font-bold">{(parseFloat(units) * wac).toLocaleString()}</span>
                                        </p>
                                        <p className="text-sm font-bold mt-1 text-green-600">
                                            الربح المتوقع: {((parseFloat(units) * (currentPrice || 0)) - (parseFloat(units) * wac)).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    onClick={() => liquidationMutation.mutate()}
                                    disabled={!units || liquidationMutation.isPending}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                >
                                    تأكيد البيع
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsLiquidationModalOpen(false); setUnits(''); setError(''); }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
