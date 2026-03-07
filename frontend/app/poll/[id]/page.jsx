"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pollsAPI } from '../../../lib/api';
import { ArrowLeft, CheckCircle2, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PollDetail() {
    const { id } = useParams();
    const router = useRouter();

    const [poll, setPoll] = useState(null);
    const [options, setOptions] = useState([]);
    const [results, setResults] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.token && !userData.id) {
            router.push('/login');
            return;
        }
        setUser(userData);
        fetchPollData(userData);
    }, [id]);

    const fetchPollData = async (userData) => {
        try {
            setLoading(true);
            setError('');

            const currentUser = userData || user;

            // 1. Get poll info (includes hasVoted for current user)
            const pollResponse = await pollsAPI.getById(id);
            const pollData = pollResponse.data;
            setPoll(pollData);
            setOptions(pollData.options);
            setHasVoted(pollData.hasVoted);

            // 2. Fetch results ONLY if they have voted
            if (pollData.hasVoted) {
                try {
                    const resultsResponse = await pollsAPI.getResults(id);
                    setResults(resultsResponse.data.results);
                } catch (resErr) {
                    console.error('Error fetching results:', resErr);
                }
            } else {
                setResults(null); // Clear results if not voted
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Poll not found or error loading poll.');
        } finally {
            setLoading(false);
        }
    };

    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (poll && poll.is_active) {
            const timer = setInterval(() => {
                const now = new Date();
                const created = new Date(poll.created_at);
                const end = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24h duration for demo
                const diff = end - now;

                if (diff <= 0) {
                    setTimeLeft('Ended');
                    clearInterval(timer);
                } else {
                    const h = Math.floor(diff / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${h}h ${m}m ${s}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [poll]);

    const handleVote = async () => {
        if (!selectedOption) {
            setError('Please select an option');
            return;
        }

        setVoting(true);
        setError('');

        try {
            await pollsAPI.vote(id, selectedOption);
            setHasVoted(true);

            // Fetch results immediately after voting
            const resultsResponse = await pollsAPI.getResults(id);
            setResults(resultsResponse.data.results);

            // Success animation trigger could go here
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit vote');
        } finally {
            setVoting(false);
        }
    };

    const calculatePercentage = (count) => {
        if (!results) return 0;
        const total = results.reduce((acc, curr) => acc + parseInt(curr.vote_count), 0);
        if (total === 0) return 0;
        return Math.round((parseInt(count) / total) * 100);
    };

    const getTotalVotes = () => {
        if (!results) return 0;
        return results.reduce((acc, curr) => acc + parseInt(curr.vote_count), 0);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Poll...</div>;
    if (error && !poll) return <div className="error-message" style={{ margin: '2rem auto', maxWidth: '600px' }}>{error}</div>;

    const backLink = user?.role === 'admin' ? '/admin' : '/home';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link href={backLink} className="hover-rotate" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s ease' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            <div className="glass-panel animate-slide-up stagger-1" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: '1.2' }}>{poll.question}</h1>
                    {poll.is_active && timeLeft && (
                        <div style={{ background: 'var(--soft-blue)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                            <Clock size={16} /> Ends in: {timeLeft}
                        </div>
                    )}
                </div>

                <div className="animate-slide-up stagger-2" style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> {getTotalVotes() || poll.total_votes || 0} Votes
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> {poll.is_active ? 'Active' : 'Closed'}
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {hasVoted ? (
                    // View Results
                    <div className="animate-fade-in">
                        {user?.role !== 'admin' && (
                            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'var(--soft-blue)', color: 'var(--primary)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>🎉</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Your vote has been successfully recorded!</div>
                            </div>
                        )}

                        <h3 className="animate-slide-up stagger-3" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Results</h3>

                        {results && results.map((result, index) => {
                            const pct = calculatePercentage(result.vote_count);
                            return (
                                <div key={result.id} style={{ marginBottom: '2rem' }} className={`animate-slide-up stagger-${Math.min(index + 4, 5)}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                                        <span style={{ fontWeight: '500' }}>{result.option_text}</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{pct}% <span style={{ fontWeight: '400', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>({result.vote_count})</span></span>
                                    </div>
                                    <div className="progress-bar-container" style={{ height: '16px' }}>
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Voting Interface
                    <>
                        <div style={{ marginBottom: '2.5rem' }}>
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`option-item ${selectedOption === option.id ? 'selected' : ''} animate-slide-up stagger-${Math.min(index + 4, 5)}`}
                                    onClick={() => setSelectedOption(option.id)}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '16px',
                                        border: '2px solid var(--border)',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: selectedOption === option.id ? 'var(--primary)' : 'var(--border)',
                                        marginRight: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: selectedOption === option.id ? 'var(--soft-blue)' : 'transparent'
                                    }}>
                                        {selectedOption === option.id && (
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '1.15rem', fontWeight: '500' }}>{option.option_text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={handleVote}
                            disabled={voting || !selectedOption}
                            style={{ padding: '1.25rem', fontSize: '1.2rem', borderRadius: '16px' }}
                        >
                            {voting ? 'Submitting...' : 'Cast Your Vote'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
