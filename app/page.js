// app/page.js
'use client';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    const { data, loading, totalIncome, totalExpenses, totalCapital, netProfit, remainingMoney } = useAppContext();

    if (loading) return (
        <div className="h-full p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8 animate-pulse text-foreground/20">
                <div className="h-10 w-64 bg-brand-gold/10 rounded-lg"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-brand-gold/10 rounded-2xl shadow-sm"></div>)}
                </div>
                <div className="h-64 bg-brand-gold/10 rounded-2xl shadow-sm"></div>
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Business Overview</h1>
                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Financial Performance & Analytics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Revenue</p>
                    <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">${totalIncome.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-emerald-500 flex items-center gap-1 italic">
                        <span>● Live from Sheets</span>
                    </div>
                </div>

                <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Expenses</p>
                    <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">${totalExpenses.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-red-500 flex items-center gap-1 italic">
                        <span>● Deducting costs</span>
                    </div>
                </div>

                <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Capital</p>
                    <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">${totalCapital.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-brand-gold flex items-center gap-1 italic">
                        <span>● Partner fund</span>
                    </div>
                </div>

                <div className="bg-black p-6 rounded-2xl shadow-xl shadow-brand-gold/5 text-white relative overflow-hidden group border border-brand-gold/10">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-brand-gold">Remaining Cash</p>
                    <p className="text-3xl font-black mt-2 tracking-tighter text-white">${remainingMoney.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-1 text-white/40 italic">
                        <span>● Cash on Hand</span>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-all duration-500 ${netProfit >= 0 ? 'bg-brand-gold text-black' : 'bg-red-600 text-white shadow-xl shadow-red-500/20'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Net Profit</p>
                    <p className="text-3xl font-black mt-2 tracking-tighter">${netProfit.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-1 opacity-60 italic">
                        <span>{netProfit >= 0 ? '↗ Performance Good' : '↘ Loss territory'}</span>
                    </div>
                </div>
            </div>

            {/* Profit Distribution */}
            <div className="bg-card-bg p-6 md:p-8 rounded-3xl shadow-sm border border-card-border">
                <div className="flex justify-between items-center mb-8 border-b border-card-border pb-4">
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tight">Partner Distribution</h2>
                        <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1 italic">Automated share calculations based on equity</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.members.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-foreground/20 italic">No partners to display distributions for.</div>
                    ) : (
                        data.members.map(member => {
                            const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                            return (
                                <div key={member.id} className="flex justify-between items-center p-5 bg-background rounded-2xl border border-card-border hover:border-brand-gold/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center font-black text-brand-gold border border-brand-gold/10 group-hover:bg-brand-gold group-hover:text-black transition-colors">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-base tracking-tight">{member.name}</p>
                                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{member.sharePercentage}% Equity</p>
                                        </div>
                                    </div>
                                    <p className={`font-black text-lg tracking-tighter ${Number(shareAmount) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        ${Number(shareAmount).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}