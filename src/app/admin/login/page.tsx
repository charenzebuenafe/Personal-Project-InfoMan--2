"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogIn, Loader2, ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter your email and password." });
      return;
    }

    setIsLoading(true);
    
    try {
      // Attempt sign in
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (error: any) {
      // If it's the primary admin email, we handle creation or credential errors gracefully
      if (cleanEmail === 'jcesperanza@neu.edu.ph') {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            // Try creating the user if they don't exist
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            const newUser = userCredential.user;
            
            // Grant admin role in Firestore
            const adminRef = doc(db, 'roles_admin', newUser.uid);
            await setDoc(adminRef, {
              email: cleanEmail,
              grantedAt: serverTimestamp(),
              role: 'Admin'
            }).catch((err) => {
              const permissionError = new FirestorePermissionError({
                path: adminRef.path,
                operation: 'create',
                requestResourceData: { email: cleanEmail, role: 'Admin' },
              });
              errorEmitter.emit('permission-error', permissionError);
              throw err;
            });

            toast({ title: "Admin Created", description: "Your administrative account has been initialized." });
          } catch (createError: any) {
            if (createError.code === 'auth/email-already-in-use') {
              // This means the password was just wrong for an existing account
              toast({ 
                variant: "destructive", 
                title: "Incorrect Password", 
                description: "This admin account already exists. Please use the password you originally set." 
              });
            } else {
              // Other errors (like permission errors which are handled by the emitter)
            }
          }
        } else {
          toast({ 
            variant: "destructive", 
            title: "Login Error", 
            description: error.message 
          });
        }
      } else {
        toast({ 
          variant: "destructive", 
          title: "Access Denied", 
          description: "Invalid credentials or account not authorized." 
        });
      }
    } finally {
      setIsLoading(false);
    }
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
            Enter your institutional credentials
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@neu.edu.ph" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-lg gap-2 mt-2" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="w-5 h-5" />}
              Sign In
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Terminal
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}