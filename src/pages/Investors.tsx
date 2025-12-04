import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, User, Phone, Mail, CreditCard } from 'lucide-react';
import { getInvestors, createInvestor } from '../lib/api';
import { Link } from 'react-router-dom';

export function Investors() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newInvestor, setNewInvestor] = useState({
        name: '',
        phone: '',
        email: '',
        national_id: '',
        notes1: '',
        notes2: '',
        notes3: ''
    });

    const queryClient = useQueryClient();

    const { data: investors, isLoading } = useQuery({
        queryKey: ['investors'],
        queryFn: getInvestors,
    });

    const createMutation = useMutation({
        mutationFn: createInvestor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investors'] });
            setIsModalOpen(false);
            setNewInvestor({
                name: '',
                phone: '',
                email: '',
                national_id: '',
                notes1: '',
                notes2: '',
                notes3: ''
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newInvestor);
    };

    const filteredInvestors = investors?.filter(investor =>
        investor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="text-center p-8">جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">المستثمرون</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة مستثمر</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="بحث عن مستثمر..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvestors?.map((investor) => (
                    <Link
                        key={investor.id}
                        to={`/investors/${investor.id}`}
                        className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-emerald-100 p-3 rounded-full">
                                <User className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{investor.name}</h3>
                                <p className="text-sm text-gray-500">
                                    تاريخ الانضمام: {new Date(investor.joined_at).toLocaleDateString('ar-SA')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">عدد الوحدات:</span>
                                <span className="font-medium">{investor.total_units.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">رأس المال المستثمر:</span>
                                <span className="font-medium">{investor.total_invested_capital.toLocaleString()} د.ك</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">إضافة مستثمر جديد</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستثمر (الاسم الرباعي)</label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={newInvestor.name}
                                        onChange={(e) => setNewInvestor({ ...newInvestor, name: e.target.value })}
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="أدخل الاسم الرباعي"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={newInvestor.phone}
                                            onChange={(e) => setNewInvestor({ ...newInvestor, phone: e.target.value })}
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            placeholder="9xxxxxxx"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
                                    <div className="relative">
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={newInvestor.email}
                                            onChange={(e) => setNewInvestor({ ...newInvestor, email: e.target.value })}
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الرقم المدني (اختياري)</label>
                                <div className="relative">
                                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newInvestor.national_id}
                                        onChange={(e) => setNewInvestor({ ...newInvestor, national_id: e.target.value })}
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="الرقم المدني"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border-t pt-3 mt-3">
                                <h3 className="font-medium text-gray-900">ملاحظات إضافية</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة 1</label>
                                    <input
                                        type="text"
                                        value={newInvestor.notes1}
                                        onChange={(e) => setNewInvestor({ ...newInvestor, notes1: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="ملاحظات عامة..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة 2</label>
                                    <input
                                        type="text"
                                        value={newInvestor.notes2}
                                        onChange={(e) => setNewInvestor({ ...newInvestor, notes2: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة 3</label>
                                    <input
                                        type="text"
                                        value={newInvestor.notes3}
                                        onChange={(e) => setNewInvestor({ ...newInvestor, notes3: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة المستثمر'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
