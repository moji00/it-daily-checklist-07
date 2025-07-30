import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import SuccessModal from '@/components/SuccessModal';
import ErrorModal from '@/components/ErrorModal';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { user, profile, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuthSuccess = () => {
    setSuccessModalOpen(true);
  };

  const handleAuthError = (message: string) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AuthModal 
          open={true} 
          onOpenChange={() => {}} // Prevent closing since it's the only way to access the app
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />
        
        <SuccessModal 
          open={successModalOpen} 
          onOpenChange={setSuccessModalOpen}
        />
        
        <ErrorModal 
          open={errorModalOpen} 
          onOpenChange={setErrorModalOpen}
          message={errorMessage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {profile?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
    </div>
  );
};

export default Index;
