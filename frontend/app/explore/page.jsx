"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { pollsAPI } from '../../lib/api';
import { Compass, Users, Clock, CheckCircle, XCircle, BarChart3, Edit, Trash2 } from 'lucide-react';
import SkeletonCard from '../../components/SkeletonCard';
import '../../components/Skeleton.css';

export default function ExplorePage() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
            return;
        }
        fetchPolls();

        // Auto-sliding interval
        const interval = setInterval(() => {
            const slider = document.getElementById('explore-slider');
            if (slider) {
                if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollBy({ left: 350, behavior: 'smooth' });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const fetchPolls = async () => {
        try {
            // Force a direct fetch to the main polls endpoint to bypass stale api.js
            const res = await api.get('/api/polls');
            setPolls(res.data);
        } catch (err) {
            console.error('Error fetching explore polls:', err);
            // Fallback to admin route if user is admin
            if (user?.role === 'admin') {
                try {
                    const resSpecial = await api.get('/api/polls/all');
                    setPolls(resSpecial.data);
                } catch (e) {
                    console.error('Fallback failed too');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePoll = async (id) => {
        if (confirm('Are you sure you want to delete this poll?')) {
            try {
                await pollsAPI.delete(id);
                fetchPolls();
            } catch (err) {
                console.error('Error deleting poll:', err);
                alert('Failed to delete poll');
            }
        }
    };

    if (loading) return (
        <div className="animate-fade-in explore-container" style={{ marginTop: '4rem' }}>
            <header className="explore-header">
                <h1 className="explore-title">Explore Polls</h1>
            </header>
            <div className="cards-grid" style={{ display: 'flex', gap: '2rem', overflow: 'hidden' }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header className="explore-header animate-slide-up stagger-1">
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--soft-blue)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }} className="hover-rotate">
                    <Compass size={40} />
                </div>
                <h1 className="explore-title">Explore Polls</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem, 3vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}>
                    Discover what the community is thinking. Browse, vote, and see results from across the platform.
                </p>
            </header>

            {polls.length === 0 ? (
                <div className="glass-panel animate-slide-up stagger-2" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <BarChart3 size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Polls Found</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Be the first to create a poll and start a conversation!</p>
                    <Link href="/polls/create" className="btn btn-primary" style={{ marginTop: '2rem' }}>Create Poll</Link>
                </div>
            ) : (
                <div className="explore-container animate-slide-up stagger-2">
                    <div className="slider-container" id="explore-slider">
                        {polls.map((poll, index) => (
                            <div
                                key={poll.id}
                                className="card slider-card"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <span className={`badge ${poll.is_active ? 'badge-active' : 'badge-inactive'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {poll.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {poll.is_active ? 'Active' : 'Closed'}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                        <Users size={14} />
                                        <span>{poll.total_votes || 0} votes</span>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', flex: '1', lineHeight: '1.4' }}>{poll.question}</h3>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Options</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                        {(poll.options || []).slice(0, 3).map(opt => (
                                            <span key={opt.id} style={{ padding: '0.3rem 0.8rem', background: 'var(--soft-blue)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>
                                                {opt.text}
                                            </span>
                                        ))}
                                        {(poll.options?.length > 3) && <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>+{(poll.options || []).length - 3} more</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                        <Clock size={16} />
                                        <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <Link
                                        href={`/poll/${poll.id}`}
                                        className="btn btn-primary"
                                        style={{ padding: '0.6rem 1.2rem' }}
                                    >
                                        {poll.is_active ? 'Vote Now' : 'View Results'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => document.getElementById('explore-slider').scrollBy({ left: -350, behavior: 'smooth' })}
                        className="theme-toggle slider-nav prev"
                    >
                        &larr;
                    </button>
                    <button
                        onClick={() => document.getElementById('explore-slider').scrollBy({ left: 350, behavior: 'smooth' })}
                        className="theme-toggle slider-nav next"
                    >
                        &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
