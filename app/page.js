// app/page.js
'use client';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    const { data, loading, totalIncome, totalExpenses, netProfit } = useAppContext();

    if (loading) return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Business Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500 font-medium">Total Income</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500 font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`p-6 rounded-xl shadow-sm text-white ${netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <p className="text-sm font-medium opacity-90">Net Profit</p>
                    <p className="text-3xl font-bold mt-2">${netProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Profit Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold mb-4">Profit Distribution</h2>
                <div className="space-y-4">
                    {data.members.map(member => {
                        const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                        return (
                            <div key={member.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{member.name}</p>
                                        <p className="text-sm text-slate-500">{member.sharePercentage}% Share</p>
                                    </div>
                                </div>
                                <p className={`font-bold ${shareAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ${shareAmount}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}