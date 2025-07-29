import { ChecklistItem } from '@/types';

export const defaultChecklistItems: Omit<ChecklistItem, 'id' | 'completed' | 'remarks' | 'completedAt' | 'completedBy' | 'subTasks'>[] = [
  // Server Management
  {
    title: 'Check Server Status',
    description: 'Verify all critical servers are running and responsive',
    category: 'servers',
    priority: 'critical'
  },
  {
    title: 'Review Server Resources',
    description: 'Monitor CPU, memory, and disk usage on all servers',
    category: 'servers',
    priority: 'high'
  },
  {
    title: 'Check System Logs',
    description: 'Review server logs for errors, warnings, or anomalies',
    category: 'servers',
    priority: 'medium'
  },
  
  // Network Management
  {
    title: 'Network Connectivity Test',
    description: 'Test internet connectivity and internal network performance',
    category: 'network',
    priority: 'high'
  },
  {
    title: 'Router & Switch Status',
    description: 'Check status of all network equipment and interfaces',
    category: 'network',
    priority: 'medium'
  },
  {
    title: 'Bandwidth Monitoring',
    description: 'Review network traffic and bandwidth utilization',
    category: 'network',
    priority: 'medium'
  },
  
  // Security
  {
    title: 'Antivirus Status Check',
    description: 'Verify antivirus software is updated and running on all systems',
    category: 'security',
    priority: 'high'
  },
  {
    title: 'Firewall Log Review',
    description: 'Check firewall logs for suspicious activities or blocked threats',
    category: 'security',
    priority: 'high'
  },
  {
    title: 'Security Updates',
    description: 'Check for and install critical security patches',
    category: 'security',
    priority: 'critical'
  },
  
  // Backup
  {
    title: 'Backup Verification',
    description: 'Verify that all scheduled backups completed successfully',
    category: 'backup',
    priority: 'critical'
  },
  {
    title: 'Backup Storage Check',
    description: 'Monitor backup storage capacity and retention policies',
    category: 'backup',
    priority: 'medium'
  },
  
  // Monitoring
  {
    title: 'System Monitoring Dashboard',
    description: 'Review monitoring dashboards for alerts and anomalies',
    category: 'monitoring',
    priority: 'high'
  },
  {
    title: 'Performance Metrics Review',
    description: 'Analyze system performance trends and metrics',
    category: 'monitoring',
    priority: 'medium'
  },
  
  // Maintenance
  {
    title: 'Clean Temporary Files',
    description: 'Remove temporary files and clear system caches',
    category: 'maintenance',
    priority: 'low'
  },
  {
    title: 'Update Documentation',
    description: 'Update system documentation and maintenance logs',
    category: 'maintenance',
    priority: 'low'
  }
];

export const categoryColors = {
  servers: 'bg-blue-100 text-blue-800 border-blue-200',
  network: 'bg-green-100 text-green-800 border-green-200',
  security: 'bg-red-100 text-red-800 border-red-200',
  backup: 'bg-purple-100 text-purple-800 border-purple-200',
  monitoring: 'bg-orange-100 text-orange-800 border-orange-200',
  maintenance: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const priorityColors = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};