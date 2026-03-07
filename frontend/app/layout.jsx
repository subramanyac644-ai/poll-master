import './globals.css';
import Navbar from '../components/Navbar';
import FAB from '../components/FAB';

export const metadata = {
    title: 'PollMaster - Online Polling System',
    description: 'A modern, real-time polling system built with Next.js and PostgreSQL',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('theme') || 'light';
                                document.documentElement.setAttribute('data-theme', theme);
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body>
                <Navbar />
                <main className="cinematic-entry">
                    {children}
                </main>
                <FAB />
            </body>
        </html>
    );
}
