"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { BarChart3, LogOut, User, PlusCircle, Settings, Bell, ChevronDown, LayoutDashboard, UserCircle, Users, Trash2 } from 'lucide-react';
import { pollsAPI, authAPI } from '../lib/api';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const [usersOpen, setUsersOpen] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Custom delete confirmation state
    const [userToDelete, setUserToDelete] = useState(null);

    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const usersRef = useRef(null);

    useEffect(() => {
        // Basic auth check
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (usersRef.current && !usersRef.current.contains(event.target)) {
                setUsersOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            // We fetch active polls and treat the newest ones as notifications
            const res = await pollsAPI.getAllActive();
            // Sort by newest first and take the top 5
            const sortedPolls = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
            setNotifications(sortedPolls);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const toggleNotifications = () => {
        if (!notificationsOpen) {
            fetchNotifications();
        }
        setNotificationsOpen(!notificationsOpen);
        setDropdownOpen(false);
        setUsersOpen(false);
    };

    const fetchUsersList = async () => {
        setLoadingUsers(true);
        try {
            const res = await authAPI.getAllUsers();
            setUsersList(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleUsers = () => {
        if (!usersOpen) {
            fetchUsersList();
        }
        setUsersOpen(!usersOpen);
        setNotificationsOpen(false);
        setDropdownOpen(false);
    };

    const handleDeleteUser = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        // Instead of native window.confirm, trigger our custom React UI confirmation
        setUserToDelete(id);
    };

    const confirmDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userToDelete) return;

        try {
            await authAPI.deleteUser(userToDelete);
            setUserToDelete(null);
            fetchUsersList(); // refresh list
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user account.");
            setUserToDelete(null);
        }
    };

    const cancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setUserToDelete(null);
    };

    const toggleProfileDropdown = () => {
        setDropdownOpen(!dropdownOpen);
        setNotificationsOpen(false);
        setUsersOpen(false);
        setUserToDelete(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setDropdownOpen(false);
        router.push('/');
    };

    const dropdownMenuStyles = {
        position: 'absolute', top: '120%', right: '-50px',
        background: '#ffffff', // White backgrounds as requested for containers
        border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '0',
        width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
        animation: 'dropdownSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    const dropdownHeaderStyles = {
        padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: '#facc15', // Sleek Yellow
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#000000', fontWeight: 'bold'
    };

    return (
        <nav className="navbar">
            <Link href={user ? (user.role === 'admin' ? '/admin' : '/home') : '/'} className="nav-brand" style={{ color: '#000000' }}>
                <BarChart3 size={28} color="#000000" />
                <span>PollMaster</span>
            </Link>

            <div className="nav-links">
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="notification-container" ref={notificationsRef} style={{ position: 'relative' }}>
                            <button
                                className="icon-btn hover-rotate"
                                title="Notifications"
                                onClick={toggleNotifications}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', borderRadius: '50%', transition: 'all 0.2s' }}
                            >
                                <Bell size={20} color="#000000" />
                            </button>

                            {notificationsOpen && (
                                <div className="dropdown-menu animate-fade-in" style={dropdownMenuStyles}>
                                    <div style={dropdownHeaderStyles}>
                                        <span>Notifications</span>
                                    </div>

                                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {loadingNotifications ? (
                                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Loading recent activity...</div>
                                        ) : notifications.length > 0 ? (
                                            notifications.map(poll => (
                                                <Link
                                                    href={`/poll/${poll.id}`}
                                                    key={`notif-${poll.id}`}
                                                    onClick={() => setNotificationsOpen(false)}
                                                    style={{
                                                        display: 'block', padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                        textDecoration: 'none', transition: 'background 0.2s',
                                                        background: '#ffffff'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                                >
                                                    <div style={{ color: '#db2777', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', textTransform: 'uppercase' }}>New Poll Created</div>
                                                    <div style={{ color: '#000000', fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{poll.question}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(poll.created_at).toLocaleDateString()}</div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>No new notifications at this time.</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8fafc' }}>
                                        <Link href="/home" onClick={() => setNotificationsOpen(false)} style={{ color: '#db2777', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>View All Polls</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {user.role === 'admin' && (
                            <div className="users-container" ref={usersRef} style={{ position: 'relative' }}>
                                <button
                                    className="icon-btn hover-rotate"
                                    title="Manage Users"
                                    onClick={toggleUsers}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', borderRadius: '50%', transition: 'all 0.2s' }}
                                >
                                    <Users size={20} color="#000000" />
                                </button>

                                {usersOpen && (
                                    <div className="dropdown-menu animate-fade-in" style={{ ...dropdownMenuStyles, width: '350px', right: '-80px' }}>
                                        <div style={dropdownHeaderStyles}>
                                            <span>Manage Users</span>
                                            <span style={{ fontSize: '0.8rem', background: 'rgba(0, 0, 0, 0.05)', color: '#000000', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>{usersList.length} Total</span>
                                        </div>

                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {loadingUsers ? (
                                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Loading users...</div>
                                            ) : usersList.length > 0 ? (
                                                usersList.map(u => (
                                                    <div
                                                        key={`user-${u.id}`}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                            transition: 'background 0.2s', background: '#ffffff'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                                    >
                                                        <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                                                            <div style={{ color: '#000000', fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                                                            <div style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                                                        </div>
                                                        {u.role !== 'admin' ? (
                                                            userToDelete === u.id ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>Are you sure?</div>
                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                        <button onClick={confirmDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Yes</button>
                                                                        <button onClick={cancelDelete} style={{ background: '#475569', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>No</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleDeleteUser(e, u.id)}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '0.4rem', borderRadius: '6px', flexShrink: 0 }}
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>Admin</span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>No users found.</div>
                                            )}
                                        </div>
                                        <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8fafc' }}>
                                            <Link href="/admin/users" onClick={() => setUsersOpen(false)} style={{ color: '#db2777', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>View Full Dashboard</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Link href="/settings" title="Settings" className="hover-rotate" style={{ color: '#000000', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s' }}>
                            <Settings size={20} />
                        </Link>

                        <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
                            <button
                                className="dropdown-toggle"
                                onClick={toggleProfileDropdown}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem 0.8rem', borderRadius: '24px',
                                    color: '#000000', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Profile</span>
                                <ChevronDown size={16} color="#000000" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                            </button>

                            {dropdownOpen && (
                                <div className="dropdown-menu animate-fade-in" style={{ ...dropdownMenuStyles, minWidth: '200px', right: '0', padding: '0.5rem' }}>
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: '600', color: '#000000' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                    </div>

                                    <Link href={user.role === 'admin' ? '/admin' : '/home'} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: '#475569', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
                                        <LayoutDashboard size={16} /> Dashboard
                                    </Link>

                                    <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: '#475569', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
                                        <UserCircle size={16} /> Profile
                                    </Link>

                                    <Link href="/settings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: '#475569', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
                                        <Settings size={16} /> Settings
                                    </Link>

                                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }}></div>

                                    <Link href="/polls/create" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: '#475569', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
                                        <PlusCircle size={16} /> New Poll
                                    </Link>

                                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }}></div>

                                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: '#ef4444', textDecoration: 'none', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>Login</Link>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
