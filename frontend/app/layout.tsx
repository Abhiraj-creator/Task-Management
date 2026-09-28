import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Manager — Streamlined Neural Task Management',
  description: 'Manage tasks, assign work, and receive real-time email notifications seamlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
