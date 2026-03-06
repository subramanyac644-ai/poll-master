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
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link href={backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>

            <div className="glass-panel">
                <h2 style={{ marginBottom: '2rem' }}>Create a New Poll</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: '2rem' }}>
                        <label htmlFor="question" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Poll Question</label>
                        <input
                            type="text"
                            id="question"
                            required
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="E.g., What is your favorite programming language?"
                            style={{ padding: '1rem', fontSize: '1.1rem' }}
                            autoComplete="off"
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Poll Options</label>

                        {options.map((option, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    required
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    style={{ marginBottom: '0' }}
                                    autoComplete="off"
                                />

                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="btn btn-danger"
                                        style={{ padding: '0.75rem' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addOption}
                            className="btn btn-secondary"
                            style={{ marginTop: '0.5rem' }}
                        >
                            <PlusCircle size={18} /> Add Another Option
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Link href={backLink} className="btn btn-secondary">Cancel</Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ minWidth: '150px' }}
                        >
                            {loading ? 'Creating...' : 'Publish Poll'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
