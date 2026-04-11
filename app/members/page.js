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

    if (loading) return <div className="animate-pulse">Loading members...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Members</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    + New Member
                </button>
            </div>

            {/* Add Member Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold">New Member</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Role</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                                placeholder="e.g. Photographer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Share %</label>
                            <input
                                required
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.sharePercentage}
                                onChange={e => setFormData({ ...formData, sharePercentage: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            />
                        </div>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg w-full">
                        Save Member
                    </button>
                </form>
            )}

            {/* Members Grid */}
            {data.members.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-100">
                    No members yet. Add your first member!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.members.map(member => {
                        const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                        return (
                            <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                                    {member.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-slate-800 truncate">{member.name}</p>
                                    <p className="text-sm text-slate-500">{member.role || 'Member'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm text-slate-400">{member.sharePercentage}% share</p>
                                    <p className={`font-bold text-lg ${Number(shareAmount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ${Number(shareAmount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
