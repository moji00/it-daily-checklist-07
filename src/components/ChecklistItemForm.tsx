import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChecklistItem, SubTask } from '@/types';
import { Plus, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['servers', 'network', 'security', 'backup', 'monitoring', 'maintenance']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ChecklistItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ChecklistItem>) => void;
  item?: ChecklistItem;
  mode: 'add' | 'edit';
}

const ChecklistItemForm: React.FC<ChecklistItemFormProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode
}) => {
  const [subTasks, setSubTasks] = useState<SubTask[]>(item?.subTasks || []);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      category: item?.category || 'servers',
      priority: item?.priority || 'medium',
      remarks: item?.remarks || '',
    },
  });

  const onSubmit = (data: FormData) => {
    onSave({ ...data, subTasks });
    onClose();
    form.reset();
    setSubTasks([]);
    setNewSubTaskTitle('');
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTaskTitle.trim(),
        completed: false
      };
      setSubTasks([...subTasks, newSubTask]);
      setNewSubTaskTitle('');
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    setSubTasks(subTasks.map(subTask =>
      subTask.id === subTaskId 
        ? { ...subTask, completed: !subTask.completed }
        : subTask
    ));
  };

  const handleRemoveSubTask = (subTaskId: string) => {
    setSubTasks(subTasks.filter(subTask => subTask.id !== subTaskId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Task' : 'Edit Task'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="servers">Servers</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="backup">Backup</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Sub-tasks</FormLabel>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add sub-task..."
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSubTask}
                  disabled={!newSubTaskTitle.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {subTasks.map((subTask) => (
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
                    type="button"
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Add Task' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistItemForm;