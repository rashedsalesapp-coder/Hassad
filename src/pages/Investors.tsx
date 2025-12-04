import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getInvestors, createInvestor } from '../lib/api';
import { Plus, Search, User } from 'lucide-react';

export function Investors() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newInvestorName, setNewInvestorName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: investors, isLoading } = useQuery({
        queryKey: ['investors'],
        queryFn: getInvestors,
    });

    const createMutation = useMutation({
        mutationFn: createInvestor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investors'] });
            setIsAdding(false);
            setNewInvestorName('');
        },
    });

    const handleAddInvestor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInvestorName.trim()) return;
        createMutation.mutate(newInvestorName);
    };

    const filteredInvestors = investors?.filter((inv) =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="text-center py-10">جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">المستثمرون</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة مستثمر
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-4 rounded-lg shadow border border-emerald-100">
                    <form onSubmit={handleAddInvestor} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                اسم المستثمر
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={newInvestorName}
                                onChange={(e) => setNewInvestorName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                placeholder="أدخل الاسم الرباعي"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                        >
                            حفظ
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                    </form>
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    placeholder="بحث عن مستثمر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredInvestors?.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">لا يوجد مستثمرين مطابقين للبحث</li>
                    ) : (
                        filteredInvestors?.map((investor) => (
                            <li key={investor.id}>
                                <Link to={`/investors/${investor.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <span className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <User className="h-6 w-6" />
                                                    </span>
                                                </div>
                                                <div className="mr-4">
                                                    <p className="text-sm font-medium text-emerald-600 truncate">{investor.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        انضم في {new Date(investor.joined_at).toLocaleDateString('ar-EG')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {investor.total_units} وحدة
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    رأس المال: {investor.total_invested_capital.toLocaleString()} دينار
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
