"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { db, type Visitor, type Purpose } from '@/lib/db';
import { Loader2, User, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CheckInTerminal() {
  const [idInput, setIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [step, setStep] = useState<'identify' | 'purpose' | 'success'>('identify');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>('reading books');
  const { toast } = useToast();

  const handleIdentify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!idInput.trim()) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    if (db.isBlocked(idInput)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your access has been blocked by the library administration.",
      });
      setIsLoading(false);
      return;
    }

    const found = db.getVisitor(idInput);
    if (found) {
      setVisitor(found);
      setStep('purpose');
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
        description: "Please check your ID or institutional email.",
      });
    }
    setIsLoading(false);
  };

  const handleCompleteCheckIn = async () => {
    if (!visitor) return;
    
    setIsLoading(true);
    db.addLog({
      visitorId: visitor.id,
      visitorName: visitor.name,
      collegeOrOffice: visitor.college !== 'N/A' ? visitor.college : visitor.office,
      checkInTime: new Date().toISOString(),
      purposeOfVisit: selectedPurpose,
    });
    
    await new Promise(r => setTimeout(r, 600));
    setStep('success');
    setIsLoading(false);

    // Reset after 3 seconds
    setTimeout(() => {
      setStep('identify');
      setIdInput('');
      setVisitor(null);
      setSelectedPurpose('reading books');
    }, 4000);
  };

  return (
    <Card className="w-full border-2 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <CardContent className="p-0">
        {step === 'identify' && (
          <div className="p-12 text-center space-y-6">
            <div className="space-y-2">
              <CardTitle className="text-4xl font-headline font-bold text-primary">Terminal Check-In</CardTitle>
              <CardDescription className="text-lg">Tap your RFID ID or enter institutional email to begin</CardDescription>
            </div>
            
            <form onSubmit={handleIdentify} className="max-w-md mx-auto space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="id-input" className="text-muted-foreground">RFID ID / Google Email</Label>
                <Input
                  id="id-input"
                  placeholder="e.g. 2023-XXXX or user@neu.edu.ph"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  className="h-14 text-xl text-center"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-14 text-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify Access"}
              </Button>
            </form>
          </div>
        )}

        {step === 'purpose' && visitor && (
          <div className="flex flex-col md:flex-row min-h-[400px]">
            <div className="md:w-1/3 bg-primary text-primary-foreground p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div className="bg-white/20 p-4 rounded-full">
                <User className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{visitor.name}</h3>
                <p className="opacity-80">{visitor.id}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{visitor.college !== 'N/A' ? visitor.college : visitor.office}</span>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-8 bg-white dark:bg-card space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">Purpose of Visit</h3>
                <p className="text-muted-foreground">Select your main reason for visiting today:</p>
              </div>

              <RadioGroup
                value={selectedPurpose}
                onValueChange={(v) => setSelectedPurpose(v as Purpose)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { value: 'reading books', label: 'Reading Books' },
                  { value: 'research in thesis', label: 'Thesis Research' },
                  { value: 'use of computer', label: 'Computer Use' },
                  { value: 'doing assignments', label: 'Doing Assignments' }
                ].map((p) => (
                  <div key={p.value}>
                    <RadioGroupItem value={p.value} id={p.value} className="peer sr-only" />
                    <Label
                      htmlFor={p.value}
                      className="flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 transition-all"
                    >
                      {p.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button onClick={handleCompleteCheckIn} className="w-full h-14 text-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Confirm Entry"}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && visitor && (
          <div className="p-20 text-center space-y-6 bg-accent/10">
            <div className="flex justify-center">
              <div className="bg-accent p-4 rounded-full text-white animate-bounce">
                <CheckCircle2 className="w-20 h-20" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-bold text-primary">Welcome to NEU Library!</h2>
              <p className="text-2xl text-muted-foreground">Enjoy your stay, {visitor.name.split(' ')[0]}.</p>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Automatically returning to standby...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
