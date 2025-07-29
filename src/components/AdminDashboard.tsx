import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DailyChecklist, User } from '@/types';
import { Users, CheckCircle, Clock, AlertTriangle, Calendar, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [allChecklists, setAllChecklists] = useState<DailyChecklist[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'user' as 'admin' | 'user' });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAllChecklists();
  }, []);

  const loadAllChecklists = () => {
    const checklists: DailyChecklist[] = [];
    
    // Load all checklists from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('checklist_')) {
        try {
          const checklist = JSON.parse(localStorage.getItem(key) || '');
          checklists.push(checklist);
        } catch (e) {
          console.error('Error parsing checklist:', e);
        }
      }
    }
    
    setAllChecklists(checklists);
  };

  const todaysChecklists = allChecklists.filter(checklist => checklist.date === today);
  const completedToday = todaysChecklists.filter(checklist => checklist.overallStatus === 'completed').length;
  const inProgressToday = todaysChecklists.filter(checklist => checklist.overallStatus === 'in-progress').length;
  const pendingToday = todaysChecklists.filter(checklist => checklist.overallStatus === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getUserName = (userId: string) => {
    const savedUsers = localStorage.getItem('mockUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const user = users.find((u: User & { password: string }) => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const savedUsers = localStorage.getItem('mockUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'IT Administrator' },
      { id: '2', username: 'john.doe', password: 'user123', role: 'user', name: 'John Doe' },
      { id: '3', username: 'jane.smith', password: 'user123', role: 'user', name: 'Jane Smith' }
    ];

    // Check if username already exists
    if (users.some((u: User & { password: string }) => u.username === newUser.username)) {
      toast({
        title: "Error", 
        description: "Username already exists",
        variant: "destructive"
      });
      return;
    }

    const newUserId = (Math.max(...users.map((u: User & { password: string }) => parseInt(u.id))) + 1).toString();
    const userToAdd = { ...newUser, id: newUserId };
    
    users.push(userToAdd);
    localStorage.setItem('mockUsers', JSON.stringify(users));
    
    setNewUser({ username: '', password: '', name: '', role: 'user' });
    setIsAddUserOpen(false);
    
    toast({
      title: "Success",
      description: `User ${newUser.name} has been added successfully`
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                  <Button onClick={addUser}>Add User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="outline" className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Active Users Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysChecklists.length}</div>
            <p className="text-xs text-muted-foreground">Users with checklists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Fully completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2 text-warning" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{inProgressToday}</div>
            <p className="text-xs text-muted-foreground">Partially completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-muted-foreground" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingToday}</div>
            <p className="text-xs text-muted-foreground">Not started</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Status</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          <h2 className="text-lg font-semibold">Today's User Activity</h2>
          {todaysChecklists.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No user activity today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todaysChecklists.map((checklist) => {
                const completedTasks = checklist.items.filter(item => item.completed).length;
                const totalTasks = checklist.items.length;
                const progressPercentage = (completedTasks / totalTasks) * 100;
                
                return (
                  <Card key={checklist.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{getUserName(checklist.userId)}</CardTitle>
                        <Badge className={getStatusColor(checklist.overallStatus)}>
                          {checklist.overallStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{completedTasks}/{totalTasks} tasks ({Math.round(progressPercentage)}%)</span>
                        </div>
                        
                        {checklist.items.some(item => item.remarks) && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Recent Remarks:</h4>
                            {checklist.items
                              .filter(item => item.remarks)
                              .slice(0, 3)
                              .map((item, index) => (
                                <div key={index} className="text-xs bg-muted p-2 rounded">
                                  <strong>{item.title}:</strong> {item.remarks}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <h2 className="text-lg font-semibold">Historical Activity</h2>
          {allChecklists.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No historical data available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                allChecklists.reduce((acc, checklist) => {
                  if (!acc[checklist.date]) {
                    acc[checklist.date] = [];
                  }
                  acc[checklist.date].push(checklist);
                  return acc;
                }, {} as { [date: string]: DailyChecklist[] })
              ).sort(([a], [b]) => b.localeCompare(a)).map(([date, checklists]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {checklists.length} users • {' '}
                      {checklists.filter(c => c.overallStatus === 'completed').length} completed • {' '}
                      {checklists.filter(c => c.overallStatus === 'in-progress').length} in progress • {' '}
                      {checklists.filter(c => c.overallStatus === 'pending').length} pending
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;