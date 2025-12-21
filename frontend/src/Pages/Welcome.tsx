import { useNavigate, Link } from 'react-router-dom';
import { Head } from '@/Components/InertiaShim';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/Components/ui/Button';
import { Building2, ArrowRight, ShieldCheck, Zap, BarChart3, Users } from 'lucide-react';

export default function Welcome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fafafa] selection:bg-primary-500 selection:text-white overflow-x-hidden font-sans">
            <Head title="Welcome to Factum - Premium Financial Management" />

            {/* Premium Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">Factum</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <Button 
                                variant="primary" 
                                onClick={() => navigate('/dashboard')}
                                icon={<ArrowRight className="w-4 h-4" />}
                                className="shadow-premium-soft"
                            >
                                Enter Dashboard
                            </Button>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors">
                                    Sign In
                                </Link>
                                <Button 
                                    variant="primary" 
                                    onClick={() => navigate('/register')}
                                    className="shadow-premium-soft"
                                >
                                    Get Started Free
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-40 pb-20 px-6">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary-50/50 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl opacity-40 -translate-x-1/2 translate-y-1/2" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-100">
                            <Zap className="w-4 h-4 text-primary-600 fill-primary-600" />
                            <span className="text-xs font-black text-primary-700 uppercase tracking-widest">Next-Gen Fiscal Ledger</span>
                        </div>
                        
                        <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            Command your <br />
                            <span className="relative">
                                business capital
                                <span className="absolute bottom-2 left-0 w-full h-4 bg-primary-100 -z-10" />
                            </span>
                            <br />
                            with precision.
                        </h1>

                        <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
                            A high-performance SaaS engine for professional accounts receivable, automated quoting, and deep financial forensics.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-10">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={() => navigate('/register')}
                                className="h-14 px-10 text-lg shadow-xl shadow-primary-100"
                            >
                                Start Free Trial
                            </Button>
                            <Button 
                                variant="soft" 
                                size="lg" 
                                onClick={() => navigate('/login')}
                                className="h-14 px-10 text-lg border-slate-200"
                            >
                                View Demo Mode
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-600/5 blur-3xl rounded-[3rem] -z-10 rotate-3" />
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium-deep overflow-hidden p-4 rotate-2 transform hover:rotate-0 transition-all duration-700">
                             {/* Mock UI Representation */}
                            <div className="bg-slate-50 rounded-[2rem] h-[500px] border border-slate-200/50 p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="w-32 h-4 bg-slate-200 rounded-full animate-pulse" />
                                        <div className="w-48 h-8 bg-slate-100 rounded-full" />
                                    </div>
                                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-primary-600" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
                                        <div className="w-12 h-1.5 bg-emerald-100 rounded-full" />
                                        <div className="w-full h-4 bg-slate-50 rounded-full" />
                                        <div className="w-2/3 h-4 bg-slate-50 rounded-full" />
                                    </div>
                                    <div className="h-32 bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
                                        <div className="w-12 h-1.5 bg-indigo-100 rounded-full" />
                                        <div className="w-full h-4 bg-slate-50 rounded-full" />
                                        <div className="w-2/3 h-4 bg-slate-50 rounded-full" />
                                    </div>
                                </div>
                                <div className="h-64 bg-primary-600 rounded-[2.5rem] p-8 shadow-2xl shadow-primary-200 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                     <div className="space-y-4">
                                         <span className="text-white/60 text-xs font-black uppercase tracking-widest">Global Liquidity</span>
                                         <div className="text-4xl font-black text-white">$1,248,590.00</div>
                                         <div className="pt-8 flex gap-3">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="h-20 w-full bg-white/20 rounded-xl" />
                                            ))}
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto text-center space-y-6 mb-20">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Engineered for Operations</h2>
                    <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                        A centralized platform for managing every dimension of your business finances without the complexity.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'Smart Invoicing', desc: 'Generate professional document records with automated due-date monitoring.', icon: <BarChart3 className="w-6 h-6" /> },
                        { title: 'Global Directory', desc: 'Centralized registry for customer profiles and supplier management.', icon: <Users className="w-6 h-6" /> },
                        { title: 'Audit Trails', desc: 'Full traceability for every transaction with secure settlement records.', icon: <ShieldCheck className="w-6 h-6" /> },
                    ].map((feature, i) => (
                        <div key={i} className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary-100 hover:shadow-premium-soft transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 border border-slate-200 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all mb-8 shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-16 text-center space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-3xl" />
                    
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                        Experience the gold standard <br /> of financial management today.
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                        Join modern enterprises leveraging our high-performance ledger for strategic business growth.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            onClick={() => navigate('/register')}
                            className="h-14 px-12 text-lg shadow-xl shadow-primary-500/20"
                        >
                            Create Free Account
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Finances SaaS Platform. High-Performance Enterprise Grade.
                </p>
            </footer>
        </div>
    );
}
