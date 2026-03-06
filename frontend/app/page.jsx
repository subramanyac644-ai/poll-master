"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pollsAPI } from '../lib/api';
import { BarChart2 } from 'lucide-react';

export default function Home() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivePolls = async () => {
            try {
                const response = await pollsAPI.getAllActive();
                setPolls(response.data);
            } catch (error) {
                console.error('Error fetching polls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivePolls();
    }, []);

    return (
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1 className="animate-slide-up" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', animationDelay: '0.1s' }}>Welcome to PollMaster</h1>
            <p className="animate-slide-up" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto', animationDelay: '0.2s' }}>
                Create, share, and manage polls effortlessly. Get real-time results and engage your audience with our modern and intuitive platform.
            </p>

            <div className="animate-slide-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', animationDelay: '0.3s' }}>
                <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    Get Started
                </Link>
                <Link href="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    I already have an account
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explore Active Polls</h2>
                <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '0 auto 2rem auto', borderRadius: '2px' }}></div>

                {loading ? (
                    <p style={{ color: '#94a3b8' }}>Loading latest polls...</p>
                ) : polls.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ color: '#64748b', marginBottom: '1rem' }}>
                            <BarChart2 size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>No active polls right now! Be the first to create one.</p>
                    </div>
                ) : (
                    <div className="cards-grid" style={{ textAlign: 'left' }}>
                        {polls.map((poll, index) => (
                            <Link href={`/poll/${poll.id}`} key={poll.id} style={{ display: 'block', animationDelay: `${0.4 + index * 0.1}s` }} className="animate-slide-up">
                                <div className="card" style={{ height: '100%', animation: 'none' }}>
                                    <div className="card-meta">
                                        Posted on {new Date(poll.created_at).toLocaleDateString()}
                                    </div>
                                    <h3 className="card-title" style={{ flex: 1 }}>{poll.question}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: '500' }}>
                                        Vote Now &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="animate-slide-up" style={{ marginTop: '5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', padding: '3rem 0', borderTop: '1px solid var(--border)', animationDelay: '0.7s' }}>
                <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
                    <div style={{ color: '#facc15', marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <h3>Easy Creation</h3>
                    <p>Admins can quickly set up polls with multiple options in just a few clicks.</p>
                </div>
                <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
                    <div style={{ color: '#0ea5e9', marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3> Instant Voting</h3>
                    <p>Users can browse active polls and cast their votes securely.</p>
                </div>
                <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
                    <div style={{ color: '#facc15', marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                    <h3>Live Results</h3>
                    <p>Watch the votes come in real-time with our dynamic result visualizations.</p>
                </div>
            </div>
        </div>
    );
}
