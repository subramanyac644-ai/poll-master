"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pollsAPI } from '../lib/api';
import { BarChart2, Flame, ArrowRight, TrendingUp } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import '../components/Skeleton.css';

export default function Home() {
    const [polls, setPolls] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivePolls = async () => {
            try {
                const response = await pollsAPI.getAllActive();
                const allPolls = response.data;
                setPolls(allPolls);

                // trending = top 3 by vote count
                const sorted = [...allPolls].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0)).slice(0, 3);
                setTrending(sorted);
            } catch (error) {
                console.error('Error fetching polls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivePolls();
    }, []);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 className="animate-slide-up stagger-1" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', fontWeight: '800', background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    PollMaster
                </h1>
                <p className="animate-slide-up stagger-2" style={{ fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto 3rem auto', color: 'rgba(255,255,255,0.8)' }}>
                    The ultimate platform for real-time audience engagement. Create stunning polls and get instant insights.
                </p>

                <div className="animate-slide-up stagger-3" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
                        Get Started Free
                    </Link>
                    <Link href="/explore" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                        Explore Polls
                    </Link>
                </div>
            </div>

            {/* Trending Section */}
            {!loading && trending.length > 0 && (
                <div className="animate-slide-up stagger-4" style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Flame color="var(--primary)" size={32} />
                        <h2 style={{ fontSize: '2rem', margin: 0 }}>Trending Now</h2>
                    </div>
                    <div className="cards-grid">
                        {trending.map((poll, index) => (
                            <Link href={`/poll/${poll.id}`} key={`trend-${poll.id}`}>
                                <div className="card" style={{ height: '100%', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp size={14} /> {poll.total_votes || 0} People Voting
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{poll.question}</h3>
                                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        Join the discussion <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>Latest Polls</h2>
                    <Link href="/explore" style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        View all <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="cards-grid">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : polls.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
                        <BarChart2 size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.7)' }}>No active polls right now! Be the first to spark a conversation.</p>
                        <Link href="/polls/create" className="btn btn-primary" style={{ marginTop: '2rem' }}>Create First Poll</Link>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {polls.slice(0, 6).map((poll, index) => (
                            <Link href={`/poll/${poll.id}`} key={poll.id}>
                                <div className="card" style={{ height: '100%' }}>
                                    <div className="card-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                                        <span>{poll.total_votes || 0} votes</span>
                                    </div>
                                    <h3 className="card-title" style={{ flex: 1, fontSize: '1.2rem' }}>{poll.question}</h3>
                                    <div style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '1.5rem' }}>
                                        Vote &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Features Info */}
            <div className="animate-slide-up stagger-5" style={{ marginTop: '8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', background: 'var(--soft-blue)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem' }}>Real-time Analytics</h3>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>Watch votes pour in with live-updating charts and detailed demographic breakdowns.</p>
                </div>
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', background: 'var(--soft-blue)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem' }}>Smart Insights</h3>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>Our AI-driven platform helps you understand the "why" behind every vote.</p>
                </div>
            </div>
        </div>
    );
}
