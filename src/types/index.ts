export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'servers' | 'network' | 'security' | 'backup' | 'monitoring' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed: boolean;
  remarks: string;
  completedAt?: Date;
  completedBy?: string;
  subTasks: SubTask[];
}

export interface DailyChecklist {
  id: string;
  date: string;
  userId: string;
  items: ChecklistItem[];
  overallStatus: 'pending' | 'in-progress' | 'completed';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}