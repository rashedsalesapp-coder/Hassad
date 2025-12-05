import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
        { to: '/investors', label: 'المستثمرون', icon: Users },
        { to: '/users', label: 'المستخدمين', icon: UserCog },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 ml-2"
                                aria-label="فتح القائمة"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>

                            {/* Logo */}
                            <div className="flex-shrink-0 flex flex-col justify-center">
                                <span className="text-2xl font-bold text-emerald-600">حصاد</span>
                                <span className="text-xs text-gray-400">مجموعه احمد الراشد</span>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse mr-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(link.to)
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:border-emerald-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <link.icon className="w-4 h-4 ml-2" />
                                        {link.label}
                                    </Link>
                                ))}
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

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-100">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${isActive(link.to)
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 ml-3" />
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleSignOut();
                                }}
                                className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5 ml-3" />
                                تسجيل الخروج
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
