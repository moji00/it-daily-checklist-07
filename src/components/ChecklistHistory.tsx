import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Eye, Download, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChecklistHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string; // if provided, show history for this user. Otherwise allow admin to pick a user
}

interface HistoryChecklist {
  id: string;
  date: string; // yyyy-mm-dd
  created_at: string; // timestamp
  overall_status: 'pending' | 'in-progress' | 'completed';
  user_id: string;
}

interface ChecklistItemRow {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  remarks: string | null;
}

const ChecklistHistory: React.FC<ChecklistHistoryProps> = ({ open, onOpenChange, userId }) => {
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string>(userId || '');
  const [history, setHistory] = useState<HistoryChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<HistoryChecklist | null>(null);
  const [items, setItems] = useState<ChecklistItemRow[]>([]);

  // Load users for admin selection if userId not provided
  useEffect(() => {
    if (!open) return;
    if (userId) return; // no need to load users when scoped to current user

    (async () => {
      try {
        const { data: adminData } = await supabase.from('admin_data').select('user_id, full_name');
        const { data: regularData } = await supabase.from('admin_user_data').select('user_id, full_name');
        const all = [
          ...(adminData || []).map((u) => ({ id: u.user_id as string, name: u.full_name as string })),
          ...(regularData || []).map((u) => ({ id: u.user_id as string, name: u.full_name as string })),
        ];
        setUsers(all);
      } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
      }
    })();
  }, [open, userId]);

  useEffect(() => {
    if (open) {
      // If userId was passed in, preselect it
      if (userId) setSelectedUser(userId);
    } else {
      // reset state when closing
      setHistory([]);
      setSelectedChecklist(null);
      setItems([]);
    }
  }, [open, userId]);

  const canQuery = useMemo(() => Boolean(selectedUser), [selectedUser]);

  const loadHistory = async () => {
    if (!canQuery) {
      toast({ title: 'Select user', description: 'Please choose a user to view history', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_checklists')
        .select('id, date, created_at, overall_status, user_id')
        .eq('user_id', selectedUser)
        .eq('overall_status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHistory((data || []) as any);
      if (!data || data.length === 0) {
        toast({ title: 'No history', description: 'No completed checklists found', });
      }
    } catch (e: any) {
      console.error('loadHistory error', e);
      toast({ title: 'Error', description: e.message || 'Failed to load history', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = async (cl: HistoryChecklist) => {
    setSelectedChecklist(cl);
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('id, title, description, category, priority, completed, completed_at, remarks')
        .eq('daily_checklist_id', cl.id)
        .order('title');
      if (error) throw error;
      setItems((data || []) as any);
    } catch (e: any) {
      console.error('load items error', e);
      toast({ title: 'Error', description: 'Failed to load checklist items', variant: 'destructive' });
    }
  };

  const printSelected = () => {
    if (!selectedChecklist) return;
    const html = `
      <html>
        <head>
          <title>Checklist - ${format(new Date(selectedChecklist.created_at), 'MMM dd, yyyy HH:mm')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 8px; }
            .muted { color: #666; margin-bottom: 16px; }
            .item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin: 6px 0; }
            .completed { background: #ecfdf5; }
          </style>
        </head>
        <body>
          <h1>Completed Checklist</h1>
          <div class="muted">${format(new Date(selectedChecklist.created_at), 'PPP p')} • Status: ${selectedChecklist.overall_status}</div>
          ${items
            .map(
              (it) => `
            <div class="item ${it.completed ? 'completed' : ''}">
              <strong>${it.title}</strong> — ${it.category} • ${it.priority}
              <div>${it.description || ''}</div>
              ${it.completed_at ? `<div class="muted">Completed at: ${format(new Date(it.completed_at), 'p')}</div>` : ''}
              ${it.remarks ? `<div class="muted"><em>Remarks:</em> ${it.remarks}</div>` : ''}
            </div>`
            )
            .join('')}
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Completed Checklist History
          </DialogTitle>
        </DialogHeader>

        {!userId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={loadHistory} disabled={isLoading || !selectedUser}>
                {isLoading ? 'Loading...' : 'Load History'}
              </Button>
            </div>
          </div>
        )}

        {userId && (
          <div className="flex justify-end">
            <Button onClick={loadHistory} disabled={isLoading}>{isLoading ? 'Loading...' : 'Refresh'}</Button>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {history.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No completed checklists found.</CardContent>
            </Card>
          )}

          {history.map((cl) => (
            <Card key={cl.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {format(new Date(cl.created_at), 'PPP p')}
                  </CardTitle>
                  <Badge className={
                    cl.overall_status === 'completed'
                      ? 'bg-success text-success-foreground'
                      : cl.overall_status === 'in-progress'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-muted text-muted-foreground'
                  }>
                    {cl.overall_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Date: {cl.date}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewDetails(cl)}>
                    <Eye className="w-4 h-4 mr-1" /> View Details
                  </Button>
                  {selectedChecklist?.id === cl.id && (
                    <Button variant="outline" size="sm" onClick={printSelected}>
                      <Download className="w-4 h-4 mr-1" /> Print
                    </Button>
                  )}
                </div>
              </CardContent>

              {selectedChecklist?.id === cl.id && (
                <CardContent>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No items found.</div>
                    ) : (
                      items.map((it) => (
                        <div key={it.id} className={`p-3 rounded border ${it.completed ? 'bg-success/10 border-success/20' : 'bg-muted/50 border-muted'}`}>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{it.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {it.category} • {it.priority}
                            </div>
                          </div>
                          {it.completed_at && (
                            <div className="text-xs text-muted-foreground mt-1">Completed at: {format(new Date(it.completed_at), 'p')}</div>
                          )}
                          {it.remarks && (
                            <div className="text-xs text-muted-foreground mt-1 italic">Remarks: {it.remarks}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistHistory;
