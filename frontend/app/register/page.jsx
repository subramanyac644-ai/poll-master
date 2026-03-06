"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../lib/api';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user' // Default to user, but allowing admin selection for testing purposes
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Frontend Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!passwordRegex.test(formData.password)) {
            setError('Password must include uppercase, lowercase, numbers, and special characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container animate-fade-in text-center">
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2>Registration Successful!</h2>
                    <p style={{ margin: '1rem 0 2rem' }}>Your account has been created. You can now login.</p>
                    <Link href="/login" className="btn btn-primary btn-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container animate-fade-in">
            <div className="animate-slide-up" style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '400px', animationDelay: '0.1s' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </div>
            <div className="glass-panel animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div>
                        <label htmlFor="reg-name-input">Full Name</label>
                        <input
                            type="text"
                            id="reg-name-input"
                            name="reg-name-input"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-email-input">Email Address</label>
                        <input
                            type="email"
                            id="reg-email-input"
                            name="reg-email-input"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-pass-input">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="reg-pass-input"
                                name="reg-pass-input"
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
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-confirm-input">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="reg-confirm-input"
                                name="reg-confirm-input"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
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
                    </div>                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
