"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Artificial delay for feel
    setTimeout(() => {
      if (password === 'admin123') {
        localStorage.setItem('admin_auth', 'true');
        toast({
          title: "Access Granted",
          description: "Welcome to the Admin Dashboard.",
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Incorrect administrative password.",
        });
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl text-primary-foreground">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access management tools
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Administrator Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify Identity"}
            </Button>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Terminal
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
