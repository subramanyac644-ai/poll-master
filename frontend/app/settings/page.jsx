"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';
import { authAPI } from '../../lib/api';

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData(prev => ({ ...prev, name: parsed.name, email: parsed.email }));
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Prepare updates, only send what has changed or is provided
        const updates = {};
        if (formData.name && formData.name !== user.name) updates.name = formData.name;
        if (formData.email && formData.email !== user.email) updates.email = formData.email;

        if (formData.password) {
            if (formData.password !== formData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
            updates.password = formData.password;
        }

        if (Object.keys(updates).length === 0) {
            setError('No changes detected.');
            return;
        }

        setLoading(true);

        try {
            const res = await authAPI.updateUser(user.id, updates);

            // Update local storage with new info immediately
            const updatedUser = { ...user, ...res.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Clear passwords
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setSuccess('Profile updated successfully!');

            // Automatically hide success message after a few seconds
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 5000);
            return;
        }

        setDeleteLoading(true);
        try {
            await authAPI.deleteUser(user.id);

            // Critical fix: Remove auth details and perform a HARD redirect.
            // Soft redirects (router.push) can leave existing layout state (like Navbar) mounted
            // and falsely showing as "logged in" until refreshed.
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete account');
            setDeleteLoading(false);
            setConfirmDelete(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Settings...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => router.push('/profile')}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Back to Profile"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>Account Settings</h2>
            </div>

            <div className="glass-panel">
                {error && <div className="error-message">{error}</div>}
                {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h3>
                        <div>
                            <label htmlFor="settings-name-input">Full Name</label>
                            <input
                                type="text"
                                id="settings-name-input"
                                name="settings-name-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label htmlFor="settings-email-input">Email Address</label>
                            <input
                                type="email"
                                id="settings-email-input"
                                name="settings-email-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Change Password</h3>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Leave these blank if you do not wish to change your password.</p>

                        <div>
                            <label htmlFor="settings-pass-input">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="settings-pass-input"
                                    name="settings-pass-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Leave blank to keep current password"
                                    autoComplete="new-password"
                                    style={{ paddingRight: '2.5rem', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="settings-confirm-input">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="settings-confirm-input"
                                    name="settings-confirm-input"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    style={{ paddingRight: '2.5rem', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </form>
            </div>

            {user.role !== 'admin' && (
                <div className="glass-panel" style={{ marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
                        <AlertTriangle size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Danger Zone</h3>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                        Once you delete your account, there is no going back. All your polls, votes, and personal data will be permanently erased. Please be certain.
                    </p>

                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="btn btn-danger btn-block"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                    >
                        {deleteLoading ? (
                            'Deleting Account...'
                        ) : confirmDelete ? (
                            'Are you absolutely sure?'
                        ) : (
                            <><Trash2 size={18} /> Delete My Account</>
                        )}
                    </button>
                    {confirmDelete && (
                        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Click again to confirm deletion.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
