"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api';
import { Trash2, User, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getAllUsers();
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleDeleteClick = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setUserToDelete(id);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const deleteUser = async (id) => {
        try {
            await authAPI.deleteUser(id);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to delete user.\nDetailed Error: ${errorMsg}\n\nIf it says "Server error", please restart your backend terminal.`);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading User Management...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={28} /> Manage Users
                    </h2>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                            <th style={{ padding: '1.25rem' }}>Name</th>
                            <th style={{ padding: '1.25rem' }}>Email</th>
                            <th style={{ padding: '1.25rem' }}>Role</th>
                            <th style={{ padding: '1.25rem' }}>Joined</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.25rem', fontWeight: '500' }}>{u.name}</td>
                                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8' }}>{u.email}</td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span className={`badge ${u.role === 'admin' ? 'badge-active' : 'badge-inactive'}`}>
                                        {u.role === 'admin' ? <><Shield size={12} style={{ marginRight: '4px' }} /> Admin</> : 'User'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                    {u.role !== 'admin' && (
                                        userToDelete === u.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 'bold' }}>Are you sure?</span>
                                                <button onClick={confirmDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Yes</button>
                                                <button onClick={cancelDelete} style={{ background: '#475569', color: 'white', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>No</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, u.id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.5rem', borderRadius: '8px' }}
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                Note: Administrator accounts are protected and cannot be deleted or managed.
            </p>
        </div>
    );
}
