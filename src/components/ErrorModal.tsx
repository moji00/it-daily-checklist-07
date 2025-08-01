import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
}
const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onOpenChange,
  title = "Error",
  message
}) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-destructive text-center">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button onClick={() => onOpenChange(false)} variant="destructive" className="w-full">
            Try Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ErrorModal;