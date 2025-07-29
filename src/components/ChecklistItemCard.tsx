import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChecklistItem, SubTask } from '@/types';
import { categoryColors, priorityColors } from '@/data/checklistItems';
import { MessageSquare, Check, Clock, AlertTriangle, Edit, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onEdit: (item: ChecklistItem) => void;
}

const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item, onUpdate, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [remarks, setRemarks] = useState(item.remarks || '');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [showSubTasks, setShowSubTasks] = useState(false);
  const { user, profile } = useAuth();

  const handleToggleComplete = () => {
    onUpdate(item.id, {
      completed: !item.completed,
      completedAt: !item.completed ? new Date() : undefined,
      completedBy: !item.completed ? (profile?.name || user?.email) : undefined,
      remarks: remarks
    });
  };

  const handleRemarksChange = (value: string) => {
    setRemarks(value);
    onUpdate(item.id, { remarks: value });
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTaskTitle.trim(),
        completed: false
      };
      onUpdate(item.id, { 
        subTasks: [...(item.subTasks || []), newSubTask] 
      });
      setNewSubTaskTitle('');
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    const updatedSubTasks = (item.subTasks || []).map(subTask =>
      subTask.id === subTaskId 
        ? { ...subTask, completed: !subTask.completed }
        : subTask
    );
    onUpdate(item.id, { subTasks: updatedSubTasks });
  };

  const handleRemoveSubTask = (subTaskId: string) => {
    const updatedSubTasks = (item.subTasks || []).filter(subTask => subTask.id !== subTaskId);
    onUpdate(item.id, { subTasks: updatedSubTasks });
  };

  const getPriorityIcon = () => {
    switch (item.priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      item.completed 
        ? 'bg-success/5 border-success/20' 
        : 'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={item.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${
                item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {item.title}
              </h3>
              <div className="flex items-center space-x-1">
                {getPriorityIcon()}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${priorityColors[item.priority]}`}
                >
                  {item.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-6 px-2"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className={`text-sm ${
              item.completed ? 'text-muted-foreground' : 'text-muted-foreground'
            }`}>
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${categoryColors[item.category]}`}
              >
                {item.category}
              </Badge>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubTasks(!showSubTasks)}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Sub-tasks ({item.subTasks?.length || 0})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Remarks
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {showSubTasks && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add new sub-task..."
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddSubTask}
                  disabled={!newSubTaskTitle.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {item.subTasks?.map((subTask) => (
                <div key={subTask.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={subTask.completed}
                    onCheckedChange={() => handleSubTaskToggle(subTask.id)}
                  />
                  <span className={`flex-1 text-sm ${
                    subTask.completed ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {subTask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubTask(subTask.id)}
                    className="h-6 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Textarea
              placeholder="Add remarks or notes about this task..."
              value={remarks}
              onChange={(e) => handleRemarksChange(e.target.value)}
              className="min-h-[80px]"
            />
            {item.completed && item.completedAt && (
              <div className="text-xs text-success flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Completed by {item.completedBy} on {new Date(item.completedAt).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ChecklistItemCard;