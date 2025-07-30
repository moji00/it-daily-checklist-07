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
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">IT Daily Checklist</h1>
          <p className="text-xl text-muted-foreground">Manage your daily IT tasks efficiently</p>
          <Button 
            onClick={() => setAuthModalOpen(true)} 
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>

        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen}
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
