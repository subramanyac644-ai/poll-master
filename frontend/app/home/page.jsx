"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pollsAPI } from '../../lib/api';
import { BarChart2, PlusCircle } from 'lucide-react';

export default function UserHome() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.token && !user.id) {
            router.push('/login');
            return;
        }

        fetchActivePolls();
    }, []);

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

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Polls...</div>;

    return (
        <div className="animate-fade-in">
            <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '3rem', animationDelay: '0.1s' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Active Polls</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>Browse active polls and cast your vote.</p>
                <Link href="/polls/create" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={20} /> Create Your Own Poll
                </Link>
            </div>

            {polls.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ color: '#64748b', marginBottom: '1rem' }}>
                        <BarChart2 size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Don't see anything? Check back later for new polls.</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {polls.map((poll, index) => (
                        <Link href={`/poll/${poll.id}`} key={poll.id} style={{ display: 'block', animationDelay: `${0.2 + index * 0.1}s` }} className="animate-slide-up">
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
    );
}
