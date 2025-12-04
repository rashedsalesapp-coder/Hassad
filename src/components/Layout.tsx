import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';

export function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-emerald-600">حصاد</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse mr-8">
                                <Link
                                    to="/"
                                    className="border-transparent text-gray-500 hover:border-emerald-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <LayoutDashboard className="w-4 h-4 ml-2" />
                                    لوحة التحكم
                                </Link>
                                <Link
                                    to="/investors"
                                    className="border-transparent text-gray-500 hover:border-emerald-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <Users className="w-4 h-4 ml-2" />
                                    المستثمرون
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
