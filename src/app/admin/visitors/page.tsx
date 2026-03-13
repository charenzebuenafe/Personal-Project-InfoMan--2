"use client";

import { useState } from 'react';
import { db, type Visitor } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserMinus, UserCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VisitorManagement() {
  const [search, setSearch] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>(db.getAllVisitors());
  const [blockedIds, setBlockedIds] = useState<string[]>(db.getBlockedIds());
  const { toast } = useToast();

  const filtered = visitors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: string) => {
    const isCurrentlyBlocked = blockedIds.includes(id);
    if (isCurrentlyBlocked) {
      db.unblockVisitor(id);
      setBlockedIds(blockedIds.filter(bid => bid !== id));
      toast({ title: "Access Restored", description: `Visitor ${id} has been unblocked.` });
    } else {
      db.blockVisitor(id);
      setBlockedIds([...blockedIds, id]);
      toast({ variant: "destructive", title: "Access Restricted", description: `Visitor ${id} has been blocked from entry.` });
    }
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
              placeholder="Search name or ID..." 
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
                {filtered.map((v) => {
                  const isBlocked = blockedIds.includes(v.id);
                  return (
                    <tr key={v.id} className={isBlocked ? "bg-red-50/30" : ""}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        {v.college !== 'N/A' ? v.college : v.office}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <Badge variant="secondary">{v.type}</Badge>
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
                          onClick={() => toggleBlock(v.id)}
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
