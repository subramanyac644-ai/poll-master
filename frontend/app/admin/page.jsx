"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pollsAPI } from '../../lib/api';
import {
    PlusCircle, Trash2, Edit
} from 'lucide-react';

export default function AdminDashboard() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.token && user.role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const response = await pollsAPI.getAllAdmin();
            setPolls(response.data);
        } catch (error) {
            console.error('Error fetching polls:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await pollsAPI.updateStatus(id, !currentStatus);
            fetchPolls();
        } catch (error) {
            console.error('Error updating poll status:', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        if (confirmDeleteId === id) {
            deletePoll(id);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
            setTimeout(() => {
                setConfirmDeleteId((prev) => (prev === id ? null : prev));
            }, 3000);
        }
    };

    const deletePoll = async (id) => {
        try {
            await pollsAPI.delete(id);
            fetchPolls();
        } catch (error) {
            console.error('Error deleting poll:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to delete poll.\nDetailed Error: ${errorMsg}\n\nIf it says "Server error", please restart your backend terminal.`);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Admin Dashboard...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Admin Dashboard</h2>
                <Link href="/admin/poll/new" className="btn btn-primary">
                    <PlusCircle size={18} /> Create New Poll
                </Link>
            </div>

            {polls.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>No polls have been created yet.</p>
                    <Link href="/admin/poll/new" className="btn btn-primary">Create Your First Poll</Link>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Poll Question</th>
                                <th style={{ padding: '1rem' }}>Created</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {polls.map((poll) => (
                                <tr key={poll.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{poll.question}</div>
                                        <Link href={`/poll/${poll.id}`} style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View Results</Link>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        {new Date(poll.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${poll.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                            {poll.is_active ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => toggleStatus(poll.id, poll.is_active)}
                                                className={`btn btn-secondary`}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                            >
                                                {poll.is_active ? 'Close Poll' : 'Open Poll'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(poll.id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.4rem 0.8rem' }}
                                                title="Delete"
                                            >
                                                {confirmDeleteId === poll.id ? 'Confirm?' : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
