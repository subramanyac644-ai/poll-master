"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pollsAPI } from '../../../lib/api';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePoll() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, []);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length <= 2) return;
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate empty options
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            setError('A poll must have at least two valid options.');
            return;
        }

        setLoading(true);

        try {
            await pollsAPI.create({ question, options: validOptions });
            // Redirect based on role
            if (user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create poll');
            setLoading(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;

    const backLink = user.role === 'admin' ? '/admin' : '/home';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }} className="hover-text-primary">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
            </div>

            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' }}>Create a New Poll</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Engage your audience with a simple, beautiful poll.</p>
                </header>

                {error && <div className="error-message" style={{ marginBottom: '2rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--soft-blue)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>1</div>
                            <label htmlFor="question" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0' }}>Poll Question</label>
                        </div>
                        <input
                            type="text"
                            id="question"
                            required
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="E.g., What is your favorite programming language?"
                            style={{ padding: '1.2rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}
                            autoComplete="off"
                        />
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--soft-blue)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>2</div>
                            <label style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0' }}>Poll Options</label>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {options.map((option, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', animation: 'fadeIn 0.3s ease-out' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="text"
                                            required
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            style={{ marginBottom: '0', padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="btn btn-danger"
                                            style={{ padding: '0.9rem', borderRadius: '14px', flexShrink: 0 }}
                                            title="Remove Option"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addOption}
                            className="btn btn-secondary"
                            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderWidth: '2px', padding: '1rem' }}
                        >
                            <PlusCircle size={20} /> Add Another Option
                        </button>
                    </section>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link href={backLink} className="btn btn-secondary" style={{ flex: '1', justifyContent: 'center', minWidth: '120px' }}>Cancel</Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ flex: '2', minWidth: '200px', justifyContent: 'center', fontSize: '1.1rem' }}
                        >
                            {loading ? 'Creating...' : (
                                <>Publish Poll <PlusCircle size={20} /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
