import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, User, Calendar, Settings, Key } from 'lucide-react';


const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">IT Daily Checklist</h1>
            <p className="text-sm text-muted-foreground flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.full_name || user?.username}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-end">
              <User className="w-3 h-3 mr-1" />
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <p className="text-muted-foreground">Password management is not available in this authentication system.</p>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;