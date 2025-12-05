import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex flex-col justify-center">
                                <span className="text-2xl font-bold text-emerald-600">حصاد</span>
                                <span className="text-xs text-gray-400">مجموعه احمد الراشد</span>
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
                                <Link
                                    to="/users"
                                    className="border-transparent text-gray-500 hover:border-emerald-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <UserCog className="w-4 h-4 ml-2" />
                                    المستخدمين
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleSignOut}
                                className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="تسجيل الخروج"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
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
