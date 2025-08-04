import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChecklistItem, DailyChecklist } from '@/types';
import { defaultChecklistItems } from '@/data/checklistItems';
import ChecklistItemCard from './ChecklistItemCard';
import ChecklistItemForm from './ChecklistItemForm';
import PrintableChecklist from './PrintableChecklist';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, AlertTriangle, RotateCcw, Download, FileText, File, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const printRef = useRef<HTMLDivElement>(null);
  
  const today = new Date().toISOString().split('T')[0];

  const downloadPDF = async () => {
    if (!checklist || !printRef.current) return;
    
    const filename = `IT_Checklist_${today}_${(user?.full_name || user?.username)?.replace(/\s+/g, '_')}.pdf`;
    
    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(printRef.current).save();
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const downloadExcel = () => {
    if (!checklist) return;

    const worksheet = XLSX.utils.json_to_sheet(
      checklist.items.map((item, index) => ({
        'No.': index + 1,
        'Task': item.title,
        'Description': item.description,
        'Category': item.category,
        'Priority': item.priority,
        'Status': item.completed ? 'Completed' : 'Pending',
        'Remarks': item.remarks || '',
        'Completed At': item.completedAt ? new Date(item.completedAt).toLocaleString() : '',
        'Completed By': item.completedBy || ''
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Checklist');

    // Add metadata sheet
    const metaData = [
      ['Date', checklist.date],
      ['Technician', user?.full_name || user?.username || 'Unknown'],
      ['Status', checklist.overallStatus],
      ['Total Tasks', checklist.items.length],
      ['Completed Tasks', checklist.items.filter(item => item.completed).length],
      ['Progress', `${Math.round((checklist.items.filter(item => item.completed).length / checklist.items.length) * 100)}%`],
      ['Generated On', new Date().toLocaleString()]
    ];
    
    const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Summary');

    const filename = `IT_Checklist_${today}_${(user?.full_name || user?.username)?.replace(/\s+/g, '_')}.xlsx`;
    
    try {
      XLSX.writeFile(workbook, filename);
      toast({
        title: "Success",
        description: "Excel file downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to download Excel file",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTodaysChecklist();
  }, [user?.id]);

  const loadTodaysChecklist = () => {
    const savedChecklist = localStorage.getItem(`checklist_${user?.id}_${today}`);
    
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      // Create new checklist for today
      const newChecklist: DailyChecklist = {
        id: `${user?.id}_${today}`,
        date: today,
        userId: user?.id || '',
        items: defaultChecklistItems.map((item, index) => ({
          ...item,
          id: `${today}_${index}`,
          completed: false,
          remarks: '',
          subTasks: []
        })),
        overallStatus: 'pending'
      };
      setChecklist(newChecklist);
      saveChecklist(newChecklist);
    }
  };

  const saveChecklist = (updatedChecklist: DailyChecklist) => {
    localStorage.setItem(`checklist_${user?.id}_${today}`, JSON.stringify(updatedChecklist));
  };

  const updateChecklistItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    if (!checklist) return;

    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const completedCount = updatedItems.filter(item => item.completed).length;
    const totalCount = updatedItems.length;
    
    let overallStatus: 'pending' | 'in-progress' | 'completed';
    if (completedCount === 0) {
      overallStatus = 'pending';
    } else if (completedCount === totalCount) {
      overallStatus = 'completed';
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed all daily IT tasks!",
      });
    } else {
      overallStatus = 'in-progress';
    }

    const updatedChecklist = {
      ...checklist,
      items: updatedItems,
      overallStatus
    };

    setChecklist(updatedChecklist);
    saveChecklist(updatedChecklist);
  };

  const resetChecklist = () => {
    if (!checklist) return;
    
    const resetItems = checklist.items.map(item => ({
      ...item,
      completed: false,
      remarks: '',
      completedAt: undefined,
      completedBy: undefined,
      subTasks: item.subTasks?.map(subTask => ({ ...subTask, completed: false })) || []
    }));

    const resetChecklist = {
      ...checklist,
      items: resetItems,
      overallStatus: 'pending' as const
    };

    setChecklist(resetChecklist);
    saveChecklist(resetChecklist);
    
    toast({
      title: "Checklist Reset",
      description: "All tasks have been reset for today.",
    });
  };

  const handleAddTask = () => {
    setEditingItem(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleEditTask = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleSaveTask = (data: Partial<ChecklistItem>) => {
    if (!checklist) return;

    if (formMode === 'add') {
      // Add new task
      const newItem: ChecklistItem = {
        id: `${today}_${Date.now()}`,
        title: data.title!,
        description: data.description!,
        category: data.category!,
        priority: data.priority!,
        completed: false,
        remarks: data.remarks || '',
        subTasks: data.subTasks || [],
      };

      const updatedChecklist = {
        ...checklist,
        items: [...checklist.items, newItem],
      };

      setChecklist(updatedChecklist);
      saveChecklist(updatedChecklist);

      toast({
        title: "Task Added",
        description: "New task has been added to the checklist.",
      });
    } else {
      // Edit existing task
      updateChecklistItem(editingItem!.id, data);

      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    }
  };

  if (!checklist) {
    return <div>Loading...</div>;
  }

  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const criticalTasks = checklist.items.filter(item => item.priority === 'critical');
  const completedCritical = criticalTasks.filter(item => item.completed).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-2xl font-bold">{completedCritical}/{criticalTasks.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">High priority items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {checklist.overallStatus === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Clock className="w-4 h-4 text-warning" />
              )}
              <span className="text-sm font-medium capitalize">{checklist.overallStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download Checklist
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={downloadPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadExcel}>
                  <File className="w-4 h-4 mr-2" />
                  Download as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetChecklist}
              className="w-full"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Daily IT Tasks</h2>
          <Button onClick={handleAddTask} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
        <div className="grid gap-4">
          {checklist.items.map((item) => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              onUpdate={updateChecklistItem}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      </div>

      {/* Form Dialog */}
      <ChecklistItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        item={editingItem || undefined}
        mode={formMode}
      />

      {/* Hidden printable component */}
      <div className="hidden">
        <PrintableChecklist 
          ref={printRef}
          checklist={checklist}
          userName={user?.full_name || user?.username || 'Unknown User'}
        />
      </div>
    </div>
  );
};

export default Dashboard;