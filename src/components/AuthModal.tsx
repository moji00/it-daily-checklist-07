import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (isLogin?: boolean) => void;
  onError: (message: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange, onSuccess, onError }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { signIn, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      onError('Please enter both email and password');
      return;
    }

    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      onError(error.message);
    } else {
      onSuccess(true); // Pass true for login
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="text-center space-y-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-center text-foreground">IT Daily Checklist</DialogTitle>
            <p className="text-muted-foreground text-center">Sign in to access your daily checklist</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;