
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ListTodo, 
  Loader2, 
  AlertCircle,
  Settings2,
  UserMinus
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AccessControlPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries for Purposes and Admins
  const purposesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'purpose_of_visits'));
  }, [db]);

  const adminsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'roles_admin'));
  }, [db]);

  const { data: purposes, isLoading: loadingPurposes } = useCollection(purposesQuery);
  const { data: admins, isLoading: loadingAdmins } = useCollection(adminsQuery);

  const handleAddPurpose = async () => {
    if (!newName || !newDesc) return;
    
    setIsAdding(true);
    const purposeData = {
      name: newName,
      description: newDesc,
      createdAt: serverTimestamp()
    };

    try {
      const colRef = collection(db, 'purpose_of_visits');
      await addDoc(colRef, purposeData).catch((err) => {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: purposeData
        });
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      });

      setNewName('');
      setNewDesc('');
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePurpose = async (id: string) => {
    const docRef = doc(db, 'purpose_of_visits', id);
    try {
      await deleteDoc(docRef).catch((err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (adminId === user?.uid) {
      alert("You cannot remove your own administrative access.");
      return;
    }

    const docRef = doc(db, 'roles_admin', adminId);
    try {
      await deleteDoc(docRef).catch((err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Access Control & Settings</h1>
        <p className="text-muted-foreground">Manage system-wide permissions and terminal configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purpose of Visit Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                Visit Purposes
              </CardTitle>
              <CardDescription>Configurable options for the Terminal.</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Visit Purpose</DialogTitle>
                  <DialogDescription>
                    Create a new category for visitors to select at the check-in station.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Purpose Name</Label>
                    <Input 
                      placeholder="e.g. Group Study" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="e.g. Collaborative academic work" 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPurpose} disabled={isAdding || !newName}>
                    {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Create Purpose
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingPurposes ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : purposes?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No purposes defined.</div>
              ) : (
                purposes?.map((purpose) => (
                  <div key={purpose.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 group">
                    <div>
                      <h4 className="font-bold text-primary capitalize">{purpose.name}</h4>
                      <p className="text-sm text-muted-foreground">{purpose.description}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePurpose(purpose.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Administrators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Authorized Administrators
            </CardTitle>
            <CardDescription>Users with full dashboard access.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingAdmins ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                admins?.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{admin.email || 'Anonymous Admin'}</h4>
                        <p className="text-xs text-muted-foreground">ID: {admin.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Active Admin</Badge>
                      {admin.id !== user?.uid && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveAdmin(admin.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 p-4 bg-accent/5 rounded-xl border-2 border-accent/20 flex gap-3">
              <AlertCircle className="w-5 h-5 text-accent-foreground shrink-0" />
              <p className="text-xs text-accent-foreground font-medium">
                Administrative roles are strictly linked to institutional email accounts. Use the removal tool to clear any redundant entries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Global Terminal Settings
          </CardTitle>
          <CardDescription>Control how library terminals behave across the campus.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl space-y-3 opacity-50 cursor-not-allowed">
            <h4 className="font-bold">Auto-Reset Timer</h4>
            <p className="text-sm text-muted-foreground">Time before the terminal returns to home screen after success.</p>
            <Badge variant="secondary">3 Seconds (Default)</Badge>
          </div>
          <div className="p-6 border rounded-2xl space-y-3 opacity-50 cursor-not-allowed">
            <h4 className="font-bold">Restricted Hours</h4>
            <p className="text-sm text-muted-foreground">Prevent check-ins during specific library closing times.</p>
            <Badge variant="secondary">Disabled</Badge>
          </div>
          <div className="p-6 border rounded-2xl space-y-3 opacity-50 cursor-not-allowed">
            <h4 className="font-bold">Verification Mode</h4>
            <p className="text-sm text-muted-foreground">Require institutional email verification for new users.</p>
            <Badge variant="secondary">Enabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
