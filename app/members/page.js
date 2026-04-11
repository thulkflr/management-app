// app/members/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';

export default function Members() {
    const { data, loading, addRecord, netProfit } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', sharePercentage: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRecord('Members', formData);
            setShowForm(false);
            setFormData({ name: '', role: '', sharePercentage: '' });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Members</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition"
                >
                    {showForm ? 'Cancel' : '+ New Member'}
                </button>
            </div>

            {/* Add Member Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-slate-800">New Member</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Ahmad Khaled"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Role</label>
                            <input
                                type="text"
                                placeholder="e.g. Photographer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Share %</label>
                            <input
                                required
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="10"
                                value={formData.sharePercentage}
                                onChange={e => setFormData({ ...formData, sharePercentage: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white p-3.5 rounded-xl w-full font-bold shadow-lg hover:bg-black transition active:scale-95">
                        Save Member
                    </button>
                </form>
            )}

            {/* Members Grid */}
            {data.members.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 text-slate-400">
                    <p className="text-lg">No members yet.</p>
                    <p className="text-sm">Add your first business partner to start tracking roles and shares.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.members.map(member => {
                        const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                        return (
                            <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        {member.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-xl text-slate-800 truncate">{member.name}</h3>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{member.role || 'Partner'}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Share</p>
                                        <p className="text-indigo-600 font-black text-lg">{member.sharePercentage}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                                        <p className={`font-black text-2xl ${Number(shareAmount) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            ${Number(shareAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
