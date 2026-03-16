
import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckInTerminal from '@/components/check-in-terminal';

export default function TerminalPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-lg">
              <Terminal className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">NEU Library Terminal</h1>
              <p className="text-muted-foreground">Digital Check-in Station (Station ID: Main)</p>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/5">
              <ArrowLeft className="w-4 h-4" />
              Back to Welcome Page
            </Button>
          </Link>
        </header>

        <CheckInTerminal />
      </div>
    </main>
  );
}
