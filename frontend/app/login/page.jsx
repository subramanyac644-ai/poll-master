"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../lib/api';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Force reload to update navbar state
            window.location.href = response.data.user.role === 'admin' ? '/admin' : '/home';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="animate-slide-up" style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '600px', animationDelay: '0.1s' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </div>
            <div className="glass-panel animate-slide-up" style={{ animationDelay: '0.2s', width: '100%', maxWidth: '600px', padding: '3rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div>
                        <label htmlFor="auth-email-input">Email Address</label>
                        <input
                            type="email"
                            id="auth-email-input"
                            name="auth-email-input"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label htmlFor="auth-pass-input">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="auth-pass-input"
                                name="auth-pass-input"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                style={{ paddingRight: '2.5rem', width: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                </div>
            </div>
        </div>
    );
}
