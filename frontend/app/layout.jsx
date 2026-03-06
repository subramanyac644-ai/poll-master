import './globals.css';

export const metadata = {
    title: 'PollMaster - Online Polling System',
    description: 'A modern, real-time polling system built with Next.js and PostgreSQL',
};

import Navbar from '../components/Navbar';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                <main className="page-transition">
                    {children}
                </main>
            </body>
        </html>
    );
}
