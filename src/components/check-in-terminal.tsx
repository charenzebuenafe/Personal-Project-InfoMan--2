
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building2, CheckCircle2, ChevronRight, LogIn } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useAuth, useDoc, useMemoFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp, addDoc } from 'firebase/firestore';

const COLLEGES = [
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Computer Studies',
  'College of Business Administration',
  'College of Education',
  'College of Nursing',
  'College of Criminology',
  'College of Music',
  'Graduate School',
  'University Office',
  'Other'
];

type Step = 'login' | 'info' | 'purpose' | 'success';

export default function CheckInTerminal() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [college, setCollege] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('reading books');
  const [isEmployee, setIsEmployee] = useState(false);

  // Memoized document reference for the user profile
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      setStep('login');
    } else if (user && !isProfileLoading) {
      if (!userProfile) {
        setStep('info');
      } else if (step === 'login' || step === 'info') {
        setStep('purpose');
      }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Authenticated", description: "Successfully signed in with Google." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!college || !user) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please select your college/office." });
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        fullName: user.displayName || 'Anonymous User',
        institutionalEmail: user.email,
        collegeOrOffice: college,
        isEmployee: isEmployee,
        isBlocked: false,
        roleIds: ['Visitor'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStep('purpose');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not save profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCheckIn = async () => {
    if (!user || !userProfile) return;
    setIsLoading(true);
    
    try {
      await addDoc(collection(db, 'visit_logs'), {
        userId: user.uid,
        visitorName: userProfile.fullName,
        visitorCollegeOrOffice: userProfile.collegeOrOffice,
        visitorIsEmployee: userProfile.isEmployee,
        checkInDateTime: serverTimestamp(),
        purposeOfVisitId: selectedPurpose, // Using name as ID for simplicity in this MVP
        purposeName: selectedPurpose,
        wasBlockedAttempt: false,
        checkInMethod: 'Institutional Google Login',
      });
      
      setStep('success');
      setTimeout(() => {
        setStep('purpose');
      }, 5000);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Check-in Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = { 'login': 25, 'info': 50, 'purpose': 75, 'success': 100 }[step];

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full border-2 border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-muted/30 p-1">
        <Progress value={progress} className="h-1 rounded-none bg-transparent" />
      </div>
      
      <CardContent className="p-0">
        {step === 'login' && (
          <div className="p-12 text-center space-y-8">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
                <LogIn className="w-8 h-8" />
              </div>
              <CardTitle className="text-4xl font-headline font-black text-primary">Library Access</CardTitle>
              <CardDescription className="text-lg">Please sign in with your institutional account</CardDescription>
            </div>
            
            <Button 
              onClick={handleGoogleLogin} 
              className="max-w-md mx-auto w-full h-14 text-xl gap-3 shadow-lg bg-white border-2 border-primary/10 hover:bg-muted text-primary font-bold" 
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sign in with Google
            </Button>
          </div>
        )}

        {step === 'info' && (
          <div className="p-12 space-y-8">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-primary">Registration</CardTitle>
              <p className="text-muted-foreground">Welcome, {user?.displayName}. Please complete your profile.</p>
            </div>

            <form onSubmit={handleInfoSubmit} className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase text-primary/70 tracking-wider">College / Office</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                  <Select value={college} onValueChange={setCollege}>
                    <SelectTrigger className="h-14 pl-10 text-lg border-2 border-primary/20 focus:border-accent transition-all">
                      <SelectValue placeholder="Select affiliation" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLEGES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border-2 border-primary/10 rounded-xl bg-primary/5">
                <input 
                  type="checkbox" 
                  id="employee" 
                  checked={isEmployee} 
                  onChange={(e) => setIsEmployee(e.target.checked)}
                  className="w-6 h-6 accent-primary"
                />
                <Label htmlFor="employee" className="text-lg font-bold text-primary">I am a Faculty or Staff member</Label>
              </div>

              <Button type="submit" className="w-full h-14 text-xl gap-2 mt-4 bg-primary hover:bg-primary/90 text-white font-bold" disabled={isLoading}>
                Complete Registration <ChevronRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        )}

        {step === 'purpose' && (
          <div className="p-12 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-primary">Purpose of Visit</CardTitle>
                <p className="text-muted-foreground">What brings you to the library today, {user?.displayName?.split(' ')[0]}?</p>
              </div>
              <Button variant="ghost" onClick={() => signOut(auth)} className="text-muted-foreground">Sign Out</Button>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
              <RadioGroup
                value={selectedPurpose}
                onValueChange={setSelectedPurpose}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { value: 'reading books', label: 'Reading Books', description: 'Accessing physical collection' },
                  { value: 'research in thesis', label: 'Thesis Research', description: 'Academic data gathering' },
                  { value: 'use of computer', label: 'Computer Use', description: 'Internet or software tools' },
                  { value: 'doing assignments', label: 'Doing Assignments', description: 'Study and coursework' }
                ].map((p) => (
                  <div key={p.value}>
                    <RadioGroupItem value={p.value} id={p.value} className="peer sr-only" />
                    <Label
                      htmlFor={p.value}
                      className="flex flex-col gap-1 p-6 border-2 border-primary/10 rounded-2xl cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 transition-all text-center group"
                    >
                      <span className="text-xl font-black text-primary group-hover:scale-105 transition-transform">{p.label}</span>
                      <span className="text-sm text-muted-foreground">{p.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="p-6 bg-primary/5 rounded-2xl flex items-center justify-between border-2 border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none text-primary">{user?.displayName}</p>
                    <p className="text-xs text-primary/60 font-bold uppercase tracking-tight">{userProfile?.collegeOrOffice}</p>
                  </div>
                </div>
                <Button onClick={handleCompleteCheckIn} className="h-14 px-10 text-xl font-black shadow-xl bg-accent hover:bg-accent/80 text-accent-foreground border-2 border-primary/10" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Confirm & Check In"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-24 text-center space-y-8 bg-accent/5">
            <div className="flex justify-center">
              <div className="bg-primary p-6 rounded-full text-white animate-bounce shadow-2xl border-4 border-accent">
                <CheckCircle2 className="w-24 h-24" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-6xl font-black text-primary tracking-tighter">Welcome to NEU Library!</h2>
              <p className="text-3xl text-muted-foreground">Enjoy your stay, <span className="text-accent-foreground font-bold bg-accent/30 px-2 rounded-md">{user?.displayName?.split(' ')[0]}</span>.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
