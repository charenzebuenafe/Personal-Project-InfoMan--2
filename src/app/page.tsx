
import Link from 'next/link';
import { BookOpen, ShieldCheck, ArrowRight, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
       {/* Hero Section */}
       <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-6 rounded-3xl text-primary border-2 border-primary/5 animate-in zoom-in duration-500">
                <Library className="w-20 h-20" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none">
                NEU Library <span className="text-accent-foreground">Flow</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
                The digital gateway to New Era University's knowledge hub. Secure, efficient, and real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-4">
            <Link href="/terminal" className="group">
              <div className="p-10 bg-card border-2 border-primary/10 rounded-[2.5rem] hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all h-full flex flex-col items-center text-center space-y-6">
                <div className="p-5 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                  <BookOpen className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-primary">Self Check-In</h3>
                  <p className="text-muted-foreground leading-relaxed">Quick entry for students and faculty using institutional email.</p>
                </div>
                <Button className="w-full h-14 text-lg font-bold gap-2 rounded-2xl">
                  Open Terminal <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Link>

            <Link href="/admin/login" className="group">
              <div className="p-10 bg-card border-2 border-primary/10 rounded-[2.5rem] hover:border-accent hover:shadow-2xl hover:-translate-y-1 transition-all h-full flex flex-col items-center text-center space-y-6">
                <div className="p-5 bg-accent/5 rounded-2xl text-accent-foreground group-hover:bg-accent transition-colors shadow-sm">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-primary">Admin Portal</h3>
                  <p className="text-muted-foreground leading-relaxed">Access analytics, manage visitors, and view live terminal data.</p>
                </div>
                <Button variant="outline" className="w-full h-14 text-lg font-bold gap-2 rounded-2xl border-accent text-accent-foreground hover:bg-accent/10">
                  Admin Login <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Link>
          </div>

          <footer className="pt-16 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} New Era University Library. Managed with Global Cloud Sync.</p>
          </footer>
       </div>
    </main>
  );
}
