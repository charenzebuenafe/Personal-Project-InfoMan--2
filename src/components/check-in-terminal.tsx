"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building2, CheckCircle2, ChevronRight, Mail, IdCard, Cloud, Wifi } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useAuth } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';

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

type Step = 'email' | 'info' | 'purpose' | 'success';

export default function CheckInTerminal() {
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('reading books');
  const [isEmployee, setIsEmployee] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        console.error("Anonymous auth failed", err);
      });
    }
  }, [auth]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('institutionalEmail', '==', email.toLowerCase().trim()));
      
      const querySnapshot = await getDocs(q).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: usersRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setRegisteredUser({ ...userData, id: querySnapshot.docs[0].id });
        setStep('purpose');
      } else {
        setStep('info');
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!college || !name || !email) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please complete all fields." });
      return;
    }

    setIsLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Authentication required");

      const userDocRef = doc(db, 'users', uid);
      const userData = {
        id: uid,
        fullName: name,
        institutionalEmail: email.toLowerCase().trim(),
        collegeOrOffice: college,
        isEmployee: isEmployee,
        isBlocked: false,
        roleIds: ['Visitor'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, userData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      setRegisteredUser(userData);
      setStep('purpose');
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCheckIn = async () => {
    if (!registeredUser) return;
    setIsLoading(true);
    
    const visitLogData = {
      userId: registeredUser.id,
      visitorName: registeredUser.fullName,
      visitorCollegeOrOffice: registeredUser.collegeOrOffice,
      visitorIsEmployee: registeredUser.isEmployee,
      checkInDateTime: serverTimestamp(),
      purposeOfVisitId: selectedPurpose,
      purposeName: selectedPurpose,
      wasBlockedAttempt: false,
      checkInMethod: 'Manual Email Input',
    };

    try {
      const logsRef = collection(db, 'visit_logs');
      await addDoc(logsRef, visitLogData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: visitLogData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
      
      setStep('success');
      setTimeout(() => {
        setStep('email');
        setEmail('');
        setName('');
        setCollege('');
        setRegisteredUser(null);
      }, 3000);
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const progress = { 'email': 25, 'info': 50, 'purpose': 75, 'success': 100 }[step];

  return (
    <Card className="w-full border-2 border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-muted/30 p-2 flex justify-between items-center px-4">
        <Progress value={progress} className="h-1 flex-1 bg-transparent mr-4" />
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-bold animate-pulse">
          <Wifi className="w-3 h-3" />
          Live Cloud Sync
        </Badge>
      </div>
      
      <CardContent className="p-0">
        {step === 'email' && (
          <div className="p-12 text-center space-y-8">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
                <IdCard className="w-8 h-8" />
              </div>
              <CardTitle className="text-4xl font-headline font-black text-primary">Library Access</CardTitle>
              <CardDescription className="text-lg">Enter your institutional email to begin</CardDescription>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <Input 
                  type="email" 
                  placeholder="name@neu.edu.ph" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 text-xl border-2 border-primary/20 focus:border-accent font-bold"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-xl gap-2 bg-primary hover:bg-primary/90 text-white font-bold" 
                disabled={isLoading || !email}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Next"} <ChevronRight className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-4">
              <Cloud className="w-3 h-3" />
              Connected to NEU Central Database
            </p>
          </div>
        )}

        {step === 'info' && (
          <div className="p-12 space-y-8">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-primary">Registration</CardTitle>
              <p className="text-muted-foreground">It looks like you're new here. Please complete your profile.</p>
            </div>

            <form onSubmit={handleInfoSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-primary/70">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                  <Input 
                    placeholder="Enter full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-10 border-2 border-primary/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-primary/70">College / Office</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                  <Select value={college} onValueChange={setCollege}>
                    <SelectTrigger className="h-12 pl-10 border-2 border-primary/10">
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
                Complete & Proceed <ChevronRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        )}

        {step === 'purpose' && (
          <div className="p-12 space-y-8">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-primary">Purpose of Visit</CardTitle>
              <p className="text-muted-foreground">Welcome to NEU Library! What brings you here, {registeredUser?.fullName?.split(' ')[0]}?</p>
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
                    <p className="text-sm font-black leading-none text-primary">{registeredUser?.fullName}</p>
                    <p className="text-xs text-primary/60 font-bold uppercase tracking-tight">{registeredUser?.collegeOrOffice}</p>
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
              <p className="text-3xl text-muted-foreground">Enjoy your stay, <span className="text-accent-foreground font-bold bg-accent/30 px-2 rounded-md">{registeredUser?.fullName?.split(' ')[0]}</span>.</p>
            </div>
            <p className="text-sm text-muted-foreground font-bold">Synchronizing with central logs...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
