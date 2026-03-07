"use client";

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function FAB() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setIsAdmin(user.role === 'admin');
        }
    }, []);

    if (!isAdmin) return null;

    return (
        <Link
            href="/admin/poll/new"
            className="fab"
            title="Create New Poll"
        >
            <Plus size={32} strokeWidth={2.5} />
        </Link>
    );
}
