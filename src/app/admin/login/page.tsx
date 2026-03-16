"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogIn, Loader2, Home, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PRIMARY_ADMINS = ['jcesperanza@neu.edu.ph', 'charenzejan.buenafe@neu.edu.ph'];

export default function AdminLoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);

  const { data: adminRole, isLoading: isAdminChecking } = useDoc(adminDocRef);

  useEffect(() => {
    if (user && !isAdminChecking && adminRole) {
      toast({ title: "Access Granted", description: "Welcome to the Admin Dashboard." });
      router.push('/admin/dashboard');
    }
  }, [user, adminRole, isAdminChecking, router, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    
    if (!cleanEmail || !password) {
      toast({ variant: "destructive", title: "Incomplete Form", description: "Please enter both email and password." });
      return;
    }

    setIsLoading(true);
    
    try {
      // Attempt standard sign in
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (signInErr: any) {
        // If it's a primary admin and login fails, try to register them
        if (PRIMARY_ADMINS.includes(cleanEmail)) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            const adminRef = doc(db, 'roles_admin', userCredential.user.uid);
            
            await setDoc(adminRef, {
              email: cleanEmail,
              grantedAt: serverTimestamp(),
              role: 'Admin',
              isAutoProvisioned: true
            }).catch((err) => {
              const permissionError = new FirestorePermissionError({
                path: adminRef.path,
                operation: 'create',
                requestResourceData: { email: cleanEmail, role: 'Admin' },
              });
              errorEmitter.emit('permission-error', permissionError);
              throw err;
            });

            toast({ title: "Admin Account Created", description: "You are now registered as a system administrator." });
            return;
          } catch (createErr: any) {
            // If email already in use, it means sign-in failed due to wrong password
            if (createErr.code === 'auth/email-already-in-use') {
              toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password for this administrator account." });
              return;
            }
            throw createErr;
          }
        }
        throw signInErr;
      }
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Authentication Error", 
        description: error.message || "Unauthorized access or invalid credentials." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/5 animate-in fade-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-primary">Admin Portal</CardTitle>
          <CardDescription className="text-base font-medium">
            Institutional credentials required
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-primary/70">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@neu.edu.ph" 
                  className="pl-10 h-11 border-primary/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Set your own password on first login" className="font-bold text-primary/70">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11 border-primary/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * If you are logging in for the first time, the password you enter here will be saved for your account.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold gap-2 mt-2 shadow-md" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="w-5 h-5" />}
              Enter Dashboard
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full gap-2 hover:bg-primary/5">
              <Home className="w-4 h-4" />
              Return to Welcome Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}