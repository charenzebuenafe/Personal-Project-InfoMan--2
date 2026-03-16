
import Link from 'next/link';
import { Terminal, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckInTerminal from '@/components/check-in-terminal';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
              <Terminal className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">NEU Library Flow</h1>
              <p className="text-muted-foreground">Digital Access & Logistics Management</p>
            </div>
          </div>
          
          <Link href="/admin/login">
            <Button variant="outline" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin Access
            </Button>
          </Link>
        </header>

        <CheckInTerminal />

        <footer className="text-center text-sm text-muted-foreground pt-4">
          <p>© {new Date().getFullYear()} New Era University Library. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
