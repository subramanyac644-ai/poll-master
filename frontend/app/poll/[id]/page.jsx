"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pollsAPI } from '../../../lib/api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
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
                <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            <div className="glass-panel animate-slide-up">
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)' }}>{poll.question}</h1>
                <div style={{ marginBottom: '2rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
                    {!poll.is_active && <span className="badge badge-inactive">Closed</span>}
                </div>

                {error && <div className="error-message">{error}</div>}

                {hasVoted ? (
                    // View Results
                    <div className="animate-fade-in">
                        {user?.role !== 'admin' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                <CheckCircle2 size={20} /> You have voted on this poll.
                            </div>
                        )}

                        <h3 style={{ marginBottom: '1.5rem' }}>Results:</h3>

                        {results && results.map((result, index) => (
                            <div key={result.id} style={{ marginBottom: '1.5rem', animationDelay: `${index * 0.1}s` }} className="animate-slide-up">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>{result.option_text}</span>
                                    <span style={{ fontWeight: 'bold' }}>{calculatePercentage(result.vote_count)}% ({result.vote_count} votes)</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${calculatePercentage(result.vote_count)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            Total Votes: {getTotalVotes()}
                        </div>
                    </div>
                ) : (
                    // Voting Interface
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`option-item ${selectedOption === option.id ? 'selected' : ''} animate-slide-up`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => setSelectedOption(option.id)}
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
                                        justifyContent: 'center'
                                    }}>
                                        {selectedOption === option.id && (
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '1.1rem' }}>{option.option_text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={handleVote}
                            disabled={voting || !selectedOption}
                            style={{ padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {voting ? 'Submitting...' : 'Submit Vote'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
