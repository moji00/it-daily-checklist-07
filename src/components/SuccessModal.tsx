import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}
const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onOpenChange,
  title = "Success!",
  message = "Login successful! Welcome to IT Daily Checklist."
}) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-success rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-success text-center">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default SuccessModal;