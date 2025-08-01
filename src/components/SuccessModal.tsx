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
      
    </Dialog>;
};
export default SuccessModal;