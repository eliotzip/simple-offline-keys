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
      // Detect the existing auth type and set it
      const existingAuthType = VaultCrypto.getAuthType();
      if (existingAuthType) {
        setAuthType(existingAuthType);
      }
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md vault-fade-in text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-vault-outline mb-6 bg-gradient-to-br from-vault-outline/20 to-transparent">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to OfflineVault</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your secure, offline password manager that keeps your data completely private and stored only on your device.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-vault-outline/20 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">100% Offline</h3>
                <p className="text-sm text-muted-foreground">No internet required, no data sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-vault-outline/20 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Military-Grade Encryption</h3>
                <p className="text-sm text-muted-foreground">AES-256 encryption keeps your passwords safe</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-vault-outline/20 flex items-center justify-center">
                <KeySquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Your Data, Your Control</h3>
                <p className="text-sm text-muted-foreground">Stored locally on your device only</p>
              </div>
            </div>
          </div>

          <Button
            variant="vault-primary"
            size="lg"
            onClick={handleWelcomeContinue}
            className="w-full"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Choose Authentication Type
  if (currentStep === 'choose-auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md vault-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-vault-outline mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Choose Your Security Method</h1>
            <p className="text-muted-foreground">
              Select how you'd like to secure your vault
            </p>
          </div>

          <div className="space-y-4">
            <Card 
              className="border-vault-outline hover:border-vault-outline-hover cursor-pointer transition-vault-smooth"
              onClick={() => handleAuthTypeSelect('pin')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-vault-outline/20 flex items-center justify-center">
                    <KeySquare className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">PIN Code</h3>
                    <p className="text-sm text-muted-foreground">4-8 digit numeric code</p>
                    <p className="text-xs text-muted-foreground mt-1">Quick and convenient access</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-vault-outline hover:border-vault-outline-hover cursor-pointer transition-vault-smooth"
              onClick={() => handleAuthTypeSelect('password')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-vault-outline/20 flex items-center justify-center">
                    <Type className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Password</h3>
                    <p className="text-sm text-muted-foreground">Full alphanumeric password</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum security with letters, numbers & symbols</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main Authentication Forms - redirect to correct auth method for existing vault
  if (currentStep === 'existing') {
    const currentAuthType = VaultCrypto.getAuthType();
    if (currentAuthType && currentAuthType !== authType) {
      setAuthType(currentAuthType);
      setCurrentStep(currentAuthType);
      return null; // Re-render with correct auth type
    }
  }

  const isNewVault = currentStep !== 'existing';
  const pageTitle = authType === 'pin' ? 'Create PIN' : 'Create Password';
  const existingTitle = authType === 'pin' ? 'Enter PIN' : 'Enter Password';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md vault-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-vault-outline mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">OfflineVault</h1>
          <p className="text-muted-foreground">
            {isNewVault ? (authType === 'pin' ? 'Create your secure PIN' : 'Create your secure password') : 'Enter your credentials to unlock'}
          </p>
        </div>

        <Card className="border-vault-outline shadow-vault">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-2">
              {isNewVault && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep('choose-auth')}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="flex-1" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              {isNewVault ? pageTitle : existingTitle}
            </CardTitle>
            <CardDescription>
              {authType === 'pin' 
                ? (isNewVault ? 'Choose a secure PIN (min 6 digits)' : 'Your vault is encrypted and stored locally')
                : (isNewVault ? 'Choose a secure password (min 6 characters)' : 'Your vault is encrypted and stored locally')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {authType === 'pin' ? (
                // PIN Input
                <>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => handlePinInput(e.target.value)}
                      className="text-center text-lg font-mono tracking-wider bg-input border-vault-outline focus:ring-1 focus:ring-white focus:border-vault-outline"
                      autoFocus
                      disabled={isLoading}
                      maxLength={8}
                    />
                  </div>

                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-2 w-fit max-w-xs">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key) => (
                        <Button
                          key={key}
                          type="button"
                          variant="vault"
                          className="aspect-square font-mono text-lg h-12 w-12 sm:h-14 sm:w-14 sm:text-xl"
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
                    className="pr-10 bg-input border-vault-outline focus:ring-1 focus:ring-white focus:border-vault-outline"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Validation Requirements */}
              {isNewVault && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Requirements:</p>
                  <div className="space-y-1">
                    {authType === 'pin' ? (
                      <div className={`flex items-center gap-2 ${pin.length >= 6 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        <div className={`w-2 h-2 rounded-full ${pin.length >= 6 ? 'bg-foreground' : 'bg-muted-foreground'}`} />
                        At least 6 digits
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 ${password.length >= 6 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-foreground' : 'bg-muted-foreground'}`} />
                        At least 6 characters
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="vault-primary"
                size="lg"
                className="w-full"
                disabled={!isValidInput() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    {isNewVault ? 'Creating...' : 'Unlocking...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {isNewVault ? 'Create Vault' : 'Unlock Vault'}
                  </>
                )}
              </Button>
            </form>

            {isNewVault && (
              <div className="mt-6 p-4 rounded-lg border border-foreground/20 bg-background">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-foreground" />
                  Important: Remember your {authType}. There is no recovery option for offline vaults.
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