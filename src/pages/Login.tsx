import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVault } from '@/contexts/VaultContext';
import { VaultCrypto } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewVault, setIsNewVault] = useState(false);
  const { unlock } = useVault();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsNewVault(!VaultCrypto.vaultExists());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    
    try {
      const success = await unlock(pin);
      
      if (success) {
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
          description: "Invalid PIN. Please try again.",
          variant: "destructive",
        });
        setPin('');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md vault-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-vault-outline mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">OfflineVault</h1>
          <p className="text-muted-foreground">
            {isNewVault ? 'Create your secure PIN' : 'Enter your PIN to unlock'}
          </p>
        </div>

        <Card className="border-vault-outline shadow-vault">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              {isNewVault ? 'Create Vault' : 'Unlock Vault'}
            </CardTitle>
            <CardDescription>
              {isNewVault 
                ? 'Choose a secure PIN (4-8 digits)' 
                : 'Your vault is encrypted and stored locally'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  className="pr-10 text-center text-lg font-mono tracking-wider bg-input border-vault-outline focus:border-vault-outline-active"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="vault"
                    size="vault-pin"
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
                    className="font-mono"
                  >
                    {key === '←' ? '⌫' : key}
                  </Button>
                ))}
              </div>

              <Button
                type="submit"
                variant="vault-primary"
                size="lg"
                className="w-full"
                disabled={pin.length < 4 || isLoading}
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
              <div className="mt-6 p-4 rounded-lg bg-vault-warning/10 border border-vault-warning/20">
                <p className="text-sm text-vault-warning font-medium">
                  ⚠️ Important: Remember your PIN. There is no recovery option for offline vaults.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>🔒 All data is encrypted and stored locally on your device</p>
        </div>
      </div>
    </div>
  );
};

export default Login;