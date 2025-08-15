import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVault } from '@/contexts/VaultContext';
import { VaultCrypto } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';
import { Lock, Shield, Eye, EyeOff, ArrowRight, KeySquare, Type, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LoginStep = 'welcome' | 'choose-auth' | 'pin' | 'password' | 'existing';
type AuthType = 'pin' | 'password';

const Login: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('welcome');
  const [authType, setAuthType] = useState<AuthType>('pin');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const { unlock } = useVault();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const vaultExists = VaultCrypto.vaultExists();
    const welcomed = localStorage.getItem('vault-welcomed');
    
    if (vaultExists) {
      setCurrentStep('existing');
    } else if (welcomed) {
      setCurrentStep('choose-auth');
      setHasWelcomed(true);
    } else {
      setCurrentStep('welcome');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authValue = authType === 'pin' ? pin : password;
    if (!authValue.trim()) return;

    setIsLoading(true);
    
    try {
      const success = await unlock(authValue);
      
      if (success) {
        const isNewVault = currentStep !== 'existing';
        toast({
          title: isNewVault ? "Vault Created" : "Welcome Back",
          description: isNewVault 
            ? "Your secure vault has been created successfully." 
            : "Vault unlocked successfully.",
        });
        navigate('/vault');
      } else {
        toast({
          title: "Access Denied",
          description: `Invalid ${authType.toUpperCase()}. Please try again.`,
          variant: "destructive",
        });
        if (authType === 'pin') {
          setPin('');
        } else {
          setPassword('');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while accessing the vault.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    // Only allow numbers and limit length
    const numericValue = value.replace(/\D/g, '').slice(0, 8);
    setPin(numericValue);
  };

  const handleWelcomeContinue = () => {
    localStorage.setItem('vault-welcomed', 'true');
    setHasWelcomed(true);
    setCurrentStep('choose-auth');
  };

  const handleAuthTypeSelect = (type: AuthType) => {
    setAuthType(type);
    setCurrentStep(type);
  };

  const isValidInput = () => {
    if (authType === 'pin') {
      return pin.length >= 6;
    } else {
      return password.length >= 6;
    }
  };

  // Welcome Page
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md fade-in text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass border-glass-border mb-8 shadow-glow">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to OfflineVault
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Your secure, offline password manager that keeps your data completely private and stored only on your device.
          </p>
          
          <div className="space-y-6 mb-12">
            <div className="glass-card text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">100% Offline</h3>
                  <p className="text-muted-foreground">No internet required, no data sharing</p>
                </div>
              </div>
            </div>
            <div className="glass-card text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Military-Grade Encryption</h3>
                  <p className="text-muted-foreground">AES-256 encryption keeps your passwords safe</p>
                </div>
              </div>
            </div>
            <div className="glass-card text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <KeySquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Data, Your Control</h3>
                  <p className="text-muted-foreground">Stored locally on your device only</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleWelcomeContinue}
            className="w-full text-lg font-semibold"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Choose Authentication Type
  if (currentStep === 'choose-auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass border-glass-border mb-6 shadow-glow">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Choose Your Security Method
            </h1>
            <p className="text-muted-foreground text-lg">
              Select how you'd like to secure your vault
            </p>
          </div>

          <div className="space-y-6">
            <Card 
              className="border-glass-border hover:shadow-glow cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleAuthTypeSelect('pin')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <KeySquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">PIN Code</h3>
                    <p className="text-muted-foreground mb-1">6-8 digit numeric code</p>
                    <p className="text-xs text-muted-foreground">Quick and convenient access</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-glass-border hover:shadow-glow cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleAuthTypeSelect('password')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow">
                    <Type className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Password</h3>
                    <p className="text-muted-foreground mb-1">Full alphanumeric password</p>
                    <p className="text-xs text-muted-foreground">Maximum security with letters, numbers & symbols</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main Authentication Forms
  const isNewVault = currentStep !== 'existing';
  const pageTitle = authType === 'pin' ? 'Create PIN' : 'Create Password';
  const existingTitle = authType === 'pin' ? 'Enter PIN' : 'Enter Password';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass border-glass-border mb-6 shadow-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            OfflineVault
          </h1>
          <p className="text-muted-foreground text-lg">
            {isNewVault ? (authType === 'pin' ? 'Create your secure PIN' : 'Create your secure password') : 'Enter your credentials to unlock'}
          </p>
        </div>

        <Card className="border-glass-border shadow-glass">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-4">
              {isNewVault && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep('choose-auth')}
                  className="h-10 w-10 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1" />
            </div>
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Lock className="w-6 h-6 text-primary" />
              {isNewVault ? pageTitle : existingTitle}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {authType === 'pin' 
                ? (isNewVault ? 'Choose a secure PIN (min 6 digits)' : 'Your vault is encrypted and stored locally')
                : (isNewVault ? 'Choose a secure password (min 6 characters)' : 'Your vault is encrypted and stored locally')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {authType === 'pin' ? (
                // PIN Input
                <>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => handlePinInput(e.target.value)}
                      className="text-center text-xl font-mono tracking-wider h-14"
                      autoFocus
                      disabled={isLoading}
                      maxLength={8}
                    />
                  </div>

                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-4 w-fit">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key) => (
                        <Button
                          key={key}
                          type="button"
                          variant="outline"
                          className="aspect-square font-mono text-xl h-14 w-14 rounded-full border-glass-border"
                          disabled={isLoading}
                          onClick={() => {
                            if (key === 'C') {
                              setPin('');
                            } else if (key === '←') {
                              setPin(pin.slice(0, -1));
                            } else if (typeof key === 'number' && pin.length < 8) {
                              setPin(pin + key.toString());
                            }
                          }}
                        >
                          {key === '←' ? '⌫' : key}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Password Input
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-14 text-lg"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              )}

              {/* Validation Requirements */}
              {isNewVault && (
                <div className="space-y-3">
                  <p className="font-semibold text-lg">Requirements:</p>
                  <div className="space-y-2">
                    {authType === 'pin' ? (
                      <div className={`flex items-center gap-3 ${pin.length >= 6 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-3 h-3 rounded-full ${pin.length >= 6 ? 'bg-primary shadow-glow' : 'bg-muted-foreground'}`} />
                        <span className="text-lg">At least 6 digits</span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 ${password.length >= 6 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-3 h-3 rounded-full ${password.length >= 6 ? 'bg-primary shadow-glow' : 'bg-muted-foreground'}`} />
                        <span className="text-lg">At least 6 characters only</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-lg font-semibold h-14"
                disabled={!isValidInput() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                    {isNewVault ? 'Creating...' : 'Unlocking...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {isNewVault ? 'Create Vault' : 'Unlock Vault'}
                  </>
                )}
              </Button>
            </form>

            {isNewVault && (
              <div className="glass-card border-glass-border">
                <p className="text-sm font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span className="text-base">
                    Important: Remember your {authType}. There is no recovery option for offline vaults.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;