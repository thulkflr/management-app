// app/page.js
'use client';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    const { data, loading, totalIncome, totalExpenses, totalCapital, netProfit } = useAppContext();

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl shadow-sm"></div>)}
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl shadow-sm"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Business Overview</h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Financial Performance & Analytics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Revenue</p>
                    <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">${totalIncome.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span>● Live from Sheets</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Expenses</p>
                    <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">${totalExpenses.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-red-500 flex items-center gap-1">
                        <span>● Deducting costs</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Capital</p>
                    <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">${totalCapital.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                        <span>● Partner fund</span>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm text-white relative overflow-hidden group transition-all duration-500 ${netProfit >= 0 ? 'bg-indigo-600' : 'bg-red-600 shadow-xl shadow-red-100'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full group-hover:w-20 group-hover:h-20 transition-all duration-300"></div>
                    <p className="text-xs font-black opacity-80 uppercase tracking-widest text-white">Net Profit</p>
                    <p className="text-3xl font-black mt-2 tracking-tighter text-white">${netProfit.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-1 text-white/70">
                        <span>{netProfit >= 0 ? '↗ Performance Good' : '↘ Loss territory'}</span>
                    </div>
                </div>
            </div>

            {/* Profit Distribution */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Partner Distribution</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Automated share calculations</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.members.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 italic">No partners to display distributions for.</div>
                    ) : (
                        data.members.map(member => {
                            const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                            return (
                                <div key={member.id} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">{member.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.sharePercentage}% Equity</p>
                                        </div>
                                    </div>
                                    <p className={`font-black text-lg tracking-tighter ${Number(shareAmount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ${Number(shareAmount).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}