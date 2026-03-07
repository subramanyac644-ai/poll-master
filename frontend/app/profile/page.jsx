"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, ArrowLeft } from 'lucide-react';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!user) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Profile...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => router.push(user.role === 'admin' ? '/admin' : '/home')}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>My Profile</h2>
            </div>

            <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        margin: '0 auto 1.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>{user.name}</h3>
                    <span className="badge badge-active" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--soft-blue)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        {user.role} Account
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: 'var(--primary)' }}><User size={24} /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.1rem' }}>Full Name</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--foreground)' }}>{user.name}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: 'var(--primary)' }}><Mail size={24} /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.1rem' }}>Email Address</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--foreground)' }}>{user.email}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: 'var(--primary)' }}><Shield size={24} /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.1rem' }}>Account ID</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', fontFamily: 'monospace', color: 'var(--foreground)' }}>#{user.id}</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button
                        onClick={() => router.push('/settings')}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        Edit Profile Details
                    </button>
                </div>
            </div>
        </div>
    );
}
