"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db, type Purpose, COLLEGES } from '@/lib/db';
import { Loader2, User, Building2, CheckCircle2, IdCard, ChevronRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Step = 'id' | 'info' | 'purpose' | 'success';

export default function CheckInTerminal() {
  const [step, setStep] = useState<Step>('id');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [idInput, setIdInput] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>('reading books');
  
  const { toast } = useToast();

  const progress = {
    'id': 25,
    'info': 50,
    'purpose': 75,
    'success': 100
  }[step];

  const handleIdSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!idInput.trim()) return;

    setIsLoading(true);
    // Artificial delay to simulate processing/lookup
    await new Promise(r => setTimeout(r, 600));

    if (db.isBlocked(idInput)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your access has been blocked by the library administration.",
      });
      setIsLoading(false);
      return;
    }

    const existingVisitor = db.getVisitor(idInput);
    if (existingVisitor) {
      // Returning visitor found - populate info and SKIP to purpose
      setName(existingVisitor.name);
      setCollege(existingVisitor.college !== 'N/A' ? existingVisitor.college : existingVisitor.office);
      setStep('purpose');
      toast({
        title: `Welcome back, ${existingVisitor.name.split(' ')[0]}!`,
        description: "Your details have been retrieved.",
      });
    } else {
      // New visitor - proceed to collect info
      setStep('info');
    }
    setIsLoading(false);
  };

  const handleInfoSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !college) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your name and select your college/office.",
      });
      return;
    }
    setStep('purpose');
  };

  const handleCompleteCheckIn = async () => {
    setIsLoading(true);
    
    // Ensure visitor is registered if they were new
    const existing = db.getVisitor(idInput);
    if (!existing) {
      db.registerVisitor({
        id: idInput,
        name: name,
        college: college,
        office: 'N/A',
        type: 'student'
      });
    }

    db.addLog({
      visitorId: idInput,
      visitorName: name,
      collegeOrOffice: college,
      checkInTime: new Date().toISOString(),
      purposeOfVisit: selectedPurpose,
    });
    
    await new Promise(r => setTimeout(r, 800));
    setStep('success');
    setIsLoading(false);

    // Reset after 4 seconds
    setTimeout(() => {
      setStep('id');
      setIdInput('');
      setName('');
      setCollege('');
      setSelectedPurpose('reading books');
    }, 4000);
  };

  return (
    <Card className="w-full border-2 border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-muted/30 p-1 no-print">
        <Progress value={progress} className="h-1 rounded-none bg-transparent" />
      </div>
      
      <CardContent className="p-0">
        {step === 'id' && (
          <div className="p-12 text-center space-y-8">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
                <IdCard className="w-8 h-8" />
              </div>
              <CardTitle className="text-4xl font-headline font-black text-primary">Student Identification</CardTitle>
              <CardDescription className="text-lg">Please enter your Student ID Number to begin</CardDescription>
            </div>
            
            <form onSubmit={handleIdSubmit} className="max-w-md mx-auto space-y-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="id-input" className="text-primary/70 text-sm uppercase tracking-widest font-bold">Identity Credential</Label>
                <Input
                  id="id-input"
                  placeholder="e.g. 2023-XXXX"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  className="h-16 text-2xl text-center border-2 border-primary/20 focus:border-accent focus:ring-accent transition-all"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-14 text-xl gap-2 shadow-lg bg-primary hover:bg-primary/90 text-white font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <>Next Step <ChevronRight className="w-5 h-5" /></>}
              </Button>
            </form>
          </div>
        )}

        {step === 'info' && (
          <div className="p-12 space-y-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep('id')} className="rounded-full hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Button>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-primary">Personal Details</CardTitle>
                <p className="text-muted-foreground">Tell us who you are</p>
              </div>
            </div>

            <form onSubmit={handleInfoSubmit} className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-bold uppercase text-primary/70 tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 pl-10 text-lg border-2 border-primary/20 focus:border-accent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="college" className="text-sm font-bold uppercase text-primary/70 tracking-wider">College / Office</Label>
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

              <Button type="submit" className="md:col-span-2 w-full h-14 text-xl gap-2 mt-4 bg-primary hover:bg-primary/90 text-white font-bold" disabled={isLoading}>
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        )}

        {step === 'purpose' && (
          <div className="p-12 space-y-8">
             <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep('id')} className="rounded-full hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Button>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-primary">Purpose of Visit</CardTitle>
                <p className="text-muted-foreground">Select your main reason for visiting today</p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
              <RadioGroup
                value={selectedPurpose}
                onValueChange={(v) => setSelectedPurpose(v as Purpose)}
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
                    <p className="text-sm font-black leading-none text-primary">{name}</p>
                    <p className="text-xs text-primary/60 font-bold uppercase tracking-tight">{college}</p>
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
              <h2 className="text-6xl font-black text-primary tracking-tighter">Welcome!</h2>
              <p className="text-3xl text-muted-foreground">Enjoy your stay at the <span className="text-primary font-black">NEU Library</span>, <span className="text-accent-foreground font-bold bg-accent/30 px-2 rounded-md">{name.split(' ')[0]}</span>.</p>
            </div>
            <div className="pt-8">
              <p className="text-sm text-primary font-bold inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-primary/10 shadow-md">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Terminal resetting for next visitor...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
