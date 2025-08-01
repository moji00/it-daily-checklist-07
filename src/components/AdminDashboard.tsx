import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DailyChecklist, User } from '@/types';
import { Users, CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon, UserPlus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const [allChecklists, setAllChecklists] = useState<DailyChecklist[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'user' as 'admin' | 'user' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<DailyChecklist | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
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

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: adminData } = await supabase
        .from('admin_data')
        .select('user_id, full_name');
      
      const { data: adminUserData } = await supabase
        .from('admin_user_data')
        .select('user_id, full_name');
      
      const allUsers = [
        ...(adminData || []).map(u => ({ id: u.user_id, name: u.full_name })),
        ...(adminUserData || []).map(u => ({ id: u.user_id, name: u.full_name }))
      ];
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
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

  const getChecklistsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return allChecklists.filter(checklist => checklist.date === dateString);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const viewChecklist = (checklist: DailyChecklist) => {
    setSelectedChecklist(checklist);
    setIsChecklistOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
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
            <CalendarIcon className="w-3 h-3 mr-1" />
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedDate ? 
                `User Activity for ${format(selectedDate, "EEEE, MMMM do, yyyy")}` : 
                "Today's User Activity"
              }
            </h2>
          </div>
          {(() => {
            const checklistsForSelectedDate = selectedDate ? getChecklistsForDate(selectedDate) : todaysChecklists;
            return checklistsForSelectedDate.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No user activity for {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "today"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {checklistsForSelectedDate.map((checklist) => {
                const completedTasks = checklist.items.filter(item => item.completed).length;
                const totalTasks = checklist.items.length;
                const progressPercentage = (completedTasks / totalTasks) * 100;
                
                return (
                  <Card key={checklist.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{getUserName(checklist.userId)}</CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewChecklist(checklist)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Tasks
                          </Button>
                        </div>
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
            );
          })()}
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

      {/* Checklist Detail Modal */}
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedChecklist && `${getUserName(selectedChecklist.userId)}'s Checklist - ${format(new Date(selectedChecklist.date), "MMMM do, yyyy")}`}
            </DialogTitle>
          </DialogHeader>
          {selectedChecklist && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(selectedChecklist.overallStatus)}>
                  {selectedChecklist.overallStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedChecklist.items.filter(item => item.completed).length} / {selectedChecklist.items.length} tasks completed
                </span>
              </div>
              
              <div className="space-y-3">
                {selectedChecklist.items.map((item) => (
                  <Card key={item.id} className={item.completed ? 'border-success' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.title}
                            </h4>
                            <Badge variant={
                              item.priority === 'critical' ? 'destructive' :
                              item.priority === 'high' ? 'default' :
                              item.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          {item.remarks && (
                            <div className="bg-muted p-2 rounded text-xs">
                              <strong>Remarks:</strong> {item.remarks}
                            </div>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-success mt-2">
                              Completed: {new Date(item.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;