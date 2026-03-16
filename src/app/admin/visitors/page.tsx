"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserMinus, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function VisitorManagement() {
  const db = useFirestore();
  const [search, setSearch] = useState('');

  const visitorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'));
  }, [db]);

  const { data: visitors, isLoading } = useCollection(visitorsQuery);

  const filtered = (visitors || []).filter(v => 
    v.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    v.institutionalEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    const userRef = doc(db, 'users', id);
    const newStatus = !currentStatus;
    
    updateDoc(userRef, { 
      isBlocked: newStatus,
      updatedAt: serverTimestamp() 
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { isBlocked: newStatus },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Visitor Management</h1>
        <p className="text-muted-foreground">Manage library access and view registered student/faculty profiles.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Directory</CardTitle>
            <CardDescription>Search for specific individuals to manage their access status.</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name or email..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Identity</th>
                  <th className="px-6 py-3">College / Office</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filtered.map((v) => {
                  const isBlocked = v.isBlocked;
                  return (
                    <tr key={v.id} className={isBlocked ? "bg-destructive/5" : ""}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{v.fullName}</div>
                        <div className="text-xs text-muted-foreground">{v.institutionalEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        {v.collegeOrOffice}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <Badge variant="secondary">
                          {v.isEmployee ? 'Employee' : 'Student'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {isBlocked ? (
                          <Badge variant="destructive" className="flex w-fit items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Active</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant={isBlocked ? "outline" : "destructive"} 
                          size="sm"
                          onClick={() => toggleBlock(v.id, !!isBlocked)}
                          className="gap-2"
                        >
                          {isBlocked ? (
                            <><UserCheck className="w-4 h-4" /> Restore</>
                          ) : (
                            <><UserMinus className="w-4 h-4" /> Block</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}