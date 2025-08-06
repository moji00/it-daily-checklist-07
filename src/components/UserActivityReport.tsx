import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarIcon, FileText, Download, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserActivity {
  user_id: string;
  username: string;
  full_name: string;
  date: string;
  completed_tasks: number;
  total_tasks: number;
  completion_percentage: number;
  status: string;
  tasks: Array<{
    title: string;
    completed: boolean;
    completed_at?: string;
    remarks?: string;
    category: string;
    priority: string;
  }>;
}

interface UserActivityReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserActivityReport: React.FC<UserActivityReportProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      // Get users from admin_data and admin_user_data tables
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_data')
        .select('user_id, full_name');

      const { data: regularUsers, error: regularError } = await supabase
        .from('admin_user_data')
        .select('user_id, full_name');

      if (adminError) throw adminError;
      if (regularError) throw regularError;

      const allUsers = [
        ...(adminUsers || []).map(u => ({ id: u.user_id, username: u.user_id, full_name: u.full_name })),
        ...(regularUsers || []).map(u => ({ id: u.user_id, username: u.user_id, full_name: u.full_name }))
      ];
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const getDateRange = () => {
    const today = new Date();
    switch (selectedPeriod) {
      case 'today':
        return { start: today, end: today };
      case 'week':
        return { start: startOfWeek(today), end: endOfWeek(today) };
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'custom':
        return { 
          start: customStartDate || today, 
          end: customEndDate || today 
        };
      default:
        return { start: today, end: today };
    }
  };

  const loadUserActivity = async () => {
    if (!selectedUser) {
      toast({
        title: "Error", 
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { start, end } = getDateRange();
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      // Get user's checklists for the date range
      const { data: checklists, error: checklistError } = await supabase
        .from('daily_checklists')
        .select(`
          *,
          checklist_items (
            id,
            title,
            completed,
            completed_at,
            remarks,
            category,
            priority
          )
        `)
        .eq('user_id', selectedUser)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (checklistError) throw checklistError;

      // Get user info - try admin_data first, then admin_user_data
      let userData: any = null;
      let userError: any = null;

      const { data: adminUser, error: adminErr } = await supabase
        .from('admin_data')
        .select('full_name')
        .eq('user_id', selectedUser)
        .single();

      if (adminUser) {
        userData = { username: selectedUser, full_name: adminUser.full_name };
      } else {
        const { data: regularUser, error: regularErr } = await supabase
          .from('admin_user_data')
          .select('full_name')
          .eq('user_id', selectedUser)
          .single();
        
        if (regularUser) {
          userData = { username: selectedUser, full_name: regularUser.full_name };
        } else {
          userError = regularErr;
        }
      }

      if (!userData && userError) throw userError;

      // Process the data
      const activities: UserActivity[] = (checklists || []).map(checklist => {
        const tasks = checklist.checklist_items || [];
        const completedTasks = tasks.filter((task: any) => task.completed).length;
        const totalTasks = tasks.length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          user_id: selectedUser,
          username: userData.username,
          full_name: userData.full_name,
          date: checklist.date,
          completed_tasks: completedTasks,
          total_tasks: totalTasks,
          completion_percentage: completionPercentage,
          status: checklist.overall_status,
          tasks: tasks.map((task: any) => ({
            title: task.title,
            completed: task.completed,
            completed_at: task.completed_at,
            remarks: task.remarks || '',
            category: task.category,
            priority: task.priority
          }))
        };
      });

      setUserActivities(activities);
    } catch (error) {
      console.error('Error loading user activity:', error);
      toast({
        title: "Error",
        description: "Failed to load user activity",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrintableReport = () => {
    if (userActivities.length === 0) {
      toast({
        title: "Error",
        description: "No data to generate report",
        variant: "destructive"
      });
      return;
    }

    const { start, end } = getDateRange();
    const user = userActivities[0];
    const totalDays = userActivities.length;
    const totalTasks = userActivities.reduce((sum, activity) => sum + activity.total_tasks, 0);
    const completedTasks = userActivities.reduce((sum, activity) => sum + activity.completed_tasks, 0);
    const averageCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Activity Report - ${user.full_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .day-section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .task-item { margin: 5px 0; padding: 8px; background: #f9f9f9; border-radius: 3px; }
          .completed { background: #d4edda; }
          .pending { background: #f8d7da; }
          .priority-high { border-left: 4px solid #dc3545; }
          .priority-medium { border-left: 4px solid #ffc107; }
          .priority-low { border-left: 4px solid #28a745; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IT Daily Checklist - User Activity Report</h1>
          <h2>${user.full_name} (${user.username})</h2>
          <p>Period: ${format(start, 'MMM dd, yyyy')} to ${format(end, 'MMM dd, yyyy')}</p>
          <p>Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Days Reported:</strong> ${totalDays}</p>
          <p><strong>Total Tasks:</strong> ${totalTasks}</p>
          <p><strong>Completed Tasks:</strong> ${completedTasks}</p>
          <p><strong>Average Completion Rate:</strong> ${averageCompletion}%</p>
        </div>

        ${userActivities.map(activity => `
          <div class="day-section">
            <h3>${format(new Date(activity.date), 'EEEE, MMMM dd, yyyy')}</h3>
            <p><strong>Status:</strong> <span style="text-transform: capitalize;">${activity.status}</span></p>
            <p><strong>Progress:</strong> ${activity.completed_tasks}/${activity.total_tasks} tasks (${activity.completion_percentage}%)</p>
            
            <h4>Tasks:</h4>
            ${activity.tasks.map(task => `
              <div class="task-item ${task.completed ? 'completed' : 'pending'} priority-${task.priority}">
                <strong>${task.title}</strong> - ${task.category}
                <br><small>Status: ${task.completed ? 'Completed' : 'Pending'}</small>
                ${task.completed_at ? `<br><small>Completed at: ${format(new Date(task.completed_at), 'HH:mm')}</small>` : ''}
                ${task.remarks ? `<br><em>Remarks: ${task.remarks}</em>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            User Activity Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadUserActivity} disabled={isLoading || !selectedUser}>
                {isLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={customStartDate} 
                      onSelect={(date) => {
                        setCustomStartDate(date);
                        setShowStartCalendar(false);
                      }} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={customEndDate} 
                      onSelect={(date) => {
                        setCustomEndDate(date);
                        setShowEndCalendar(false);
                      }} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Report Header */}
          {userActivities.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">
                  Report for {userActivities[0]?.full_name}
                </h3>
                <Badge variant="outline">
                  {userActivities.length} day{userActivities.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button onClick={generatePrintableReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Print Report
              </Button>
            </div>
          )}

          {/* Activity Results */}
          {userActivities.length > 0 ? (
            <div className="space-y-4">
              {userActivities.map((activity, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {format(new Date(activity.date), 'EEEE, MMMM dd, yyyy')}
                      </CardTitle>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.completed_tasks}/{activity.total_tasks} tasks completed ({activity.completion_percentage}%)
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activity.tasks.map((task, taskIndex) => (
                        <div 
                          key={taskIndex} 
                          className={`p-3 rounded-md border ${task.completed ? 'bg-success/10 border-success/20' : 'bg-muted/50 border-muted'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline">{task.category}</Badge>
                              {task.completed && <Badge variant="default">✓</Badge>}
                            </div>
                          </div>
                          {task.completed_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed at: {format(new Date(task.completed_at), 'HH:mm')}
                            </div>
                          )}
                          {task.remarks && (
                            <div className="text-xs text-muted-foreground mt-1 italic">
                              Remarks: {task.remarks}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !isLoading && selectedUser && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No activity found for the selected period</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserActivityReport;