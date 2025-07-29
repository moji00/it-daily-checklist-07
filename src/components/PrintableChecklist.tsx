import React from 'react';
import { ChecklistItem, DailyChecklist } from '@/types';
import { CheckCircle, Circle, AlertTriangle, Clock } from 'lucide-react';

interface PrintableChecklistProps {
  checklist: DailyChecklist;
  userName: string;
}

const PrintableChecklist = React.forwardRef<HTMLDivElement, PrintableChecklistProps>(
  ({ checklist, userName }, ref) => {
    const getPriorityIcon = (priority: string) => {
      switch (priority) {
        case 'critical':
          return <AlertTriangle className="w-4 h-4 text-red-600" />;
        case 'high':
          return <Clock className="w-4 h-4 text-orange-500" />;
        case 'medium':
          return <Clock className="w-4 h-4 text-yellow-500" />;
        default:
          return <Clock className="w-4 h-4 text-gray-400" />;
      }
    };

    const getCategoryColor = (category: string) => {
      const colors = {
        'servers': 'bg-blue-100 text-blue-800',
        'network': 'bg-green-100 text-green-800',
        'security': 'bg-red-100 text-red-800',
        'backup': 'bg-purple-100 text-purple-800',
        'monitoring': 'bg-yellow-100 text-yellow-800',
        'maintenance': 'bg-gray-100 text-gray-800'
      };
      return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <style>
          {`
            @media print {
              body { margin: 0; }
              .print\\:p-4 { padding: 1rem; }
              .print\\:hidden { display: none; }
              .print\\:text-sm { font-size: 0.875rem; }
              .print\\:break-inside-avoid { break-inside: avoid; }
            }
          `}
        </style>
        
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IT Daily Checklist</h1>
          <div className="text-lg text-gray-600">
            <p>Date: {new Date(checklist.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p>Technician: {userName}</p>
            <p>Status: <span className="font-semibold capitalize">{checklist.overallStatus}</span></p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Tasks:</span> {checklist.items.length}
            </div>
            <div>
              <span className="font-medium">Completed:</span> {checklist.items.filter(item => item.completed).length}
            </div>
            <div>
              <span className="font-medium">Critical Tasks:</span> {checklist.items.filter(item => item.priority === 'critical').length}
            </div>
            <div>
              <span className="font-medium">Progress:</span> {Math.round((checklist.items.filter(item => item.completed).length / checklist.items.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Task Details</h2>
          {checklist.items.map((item, index) => (
            <div key={item.id} className="border border-gray-300 rounded-lg p-4 print:break-inside-avoid">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(item.priority)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
              </div>
              
              {item.remarks && (
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Remarks:</h4>
                  <p className="text-sm text-gray-700">{item.remarks}</p>
                </div>
              )}
              
              {item.completed && item.completedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Completed: {new Date(item.completedAt).toLocaleString()}
                  {item.completedBy && ` by ${item.completedBy}`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <div className="text-sm text-gray-600 text-center">
            <p>Generated on {new Date().toLocaleString()}</p>
            <p className="mt-2">This checklist ensures all critical IT infrastructure components are monitored and maintained daily.</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableChecklist.displayName = 'PrintableChecklist';

export default PrintableChecklist;