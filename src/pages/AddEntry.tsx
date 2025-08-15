import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVault } from '@/contexts/VaultContext';
import { useToast } from '@/hooks/use-toast';
import { VaultEntry } from '@/lib/crypto';
import { ArrowLeft, Save, Eye, EyeOff, Key, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AddEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const { data, saveEntry, updateEntry } = useVault();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    folderId: 'no-folder',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isEditing && data) {
      const entry = data.entries.find(e => e.id === editId);
      if (entry) {
        setFormData({
          title: entry.title,
          username: entry.username,
          password: entry.password,
          website: entry.website || '',
          folderId: entry.folderId || 'no-folder',
        });
      }
    }
  }, [isEditing, editId, data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show warning if password is empty
    if (!formData.password.trim()) {
      setShowWarning(true);
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for this entry.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const entryData = {
        title: formData.title.trim(),
        username: formData.username.trim(),
        password: formData.password,
        website: formData.website.trim() || undefined,
        folderId: formData.folderId === 'no-folder' ? undefined : formData.folderId || undefined,
        order: 0, // Will be set by the context
      };

      let success = false;
      if (isEditing) {
        success = await updateEntry(editId, entryData);
      } else {
        success = await saveEntry(entryData);
      }

      if (success) {
        toast({
          title: isEditing ? "Entry Updated" : "Entry Saved",
          description: `${formData.title} has been ${isEditing ? 'updated' : 'saved'} successfully.`,
        });
        navigate('/vault');
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? 'update' : 'save'} entry.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWithoutPassword = async () => {
    setShowWarning(false);
    setIsLoading(true);

    try {
      const entryData = {
        title: formData.title.trim(),
        username: formData.username.trim(),
        password: formData.password || '(No password)',
        website: formData.website.trim() || undefined,
        folderId: formData.folderId === 'no-folder' ? undefined : formData.folderId || undefined,
        order: 0,
      };

      let success = false;
      if (isEditing) {
        success = await updateEntry(editId, entryData);
      } else {
        success = await saveEntry(entryData);
      }

      if (success) {
        toast({
          title: isEditing ? "Entry Updated" : "Entry Saved",
          description: `${formData.title} has been ${isEditing ? 'updated' : 'saved'} without a password.`,
        });
        navigate('/vault');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
    toast({
      title: "Password Generated",
      description: "A secure password has been generated.",
    });
  };

  const sortedFolders = data?.folders.sort((a, b) => a.order - b.order) || [];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 vault-fade-in">
          <Button variant="vault" size="icon" onClick={() => navigate('/vault')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">
            {isEditing ? 'Edit Entry' : 'Add New Entry'}
          </h1>
        </div>

        {/* Form */}
        <Card className="border-vault-outline shadow-vault vault-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Entry Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Gmail, Bank Account"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-input border-vault-outline focus:border-vault-outline-active"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username/Email</Label>
                <Input
                  id="username"
                  placeholder="Enter username or email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-input border-vault-outline focus:border-vault-outline-active"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generatePassword}
                    className="text-xs"
                  >
                    Generate
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 bg-input border-vault-outline focus:border-vault-outline-active"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-input border-vault-outline focus:border-vault-outline-active"
                />
              </div>

              {sortedFolders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="folder">Folder</Label>
                  <Select
                    value={formData.folderId || 'no-folder'}
                    onValueChange={(value) => setFormData({ ...formData, folderId: value === 'no-folder' ? '' : value })}
                  >
                    <SelectTrigger className="bg-input border-vault-outline focus:border-vault-outline-active">
                      <SelectValue placeholder="Select a folder (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-folder">No folder</SelectItem>
                      {sortedFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="vault"
                  className="flex-1"
                  onClick={() => navigate('/vault')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="vault-primary"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Update' : 'Save'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Warning Dialog */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm border-vault-warning shadow-vault-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-vault-warning">
                  <AlertTriangle className="w-5 h-5" />
                  No Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You're about to save an entry without a password. This is not recommended for security.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="vault"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowWarning(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="vault-danger"
                    size="sm"
                    className="flex-1"
                    onClick={handleSaveWithoutPassword}
                    disabled={isLoading}
                  >
                    Save Anyway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEntry;