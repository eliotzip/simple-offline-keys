import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useVault } from '@/contexts/VaultContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { copyToClipboard, VaultEntry, VaultFolder } from '@/lib/crypto';
import { 
  Search, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  LogOut, 
  Folder, 
  FolderPlus,
  User,
  Eye,
  EyeOff,
  Shield,
  MoreVertical,
  GripVertical
} from 'lucide-react';
import DragHandle from '@/components/ui/drag-handle';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextType,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableEntryProps {
  entry: VaultEntry;
  onCopy: (text: string, label: string) => void;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (id: string) => void;
  onTogglePassword: (id: string) => void;
  showPassword: boolean;
}

const SortableEntry: React.FC<SortableEntryProps> = ({
  entry,
  onCopy,
  onEdit,
  onDelete,
  onTogglePassword,
  showPassword,
}) => {
  const isMobile = useIsMobile();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
    scale: isDragging ? '1.02' : '1',
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete(entry.id);
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className={`border-vault-outline hover:border-vault-outline-hover transition-vault-smooth hover:shadow-vault group ${
          isDragging ? 'shadow-vault-hover border-vault-outline-active' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="cursor-grab active:cursor-grabbing p-1 -ml-1"
                  {...attributes} 
                  {...listeners}
                >
                  <DragHandle className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium truncate">{entry.title}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="truncate">
                      <span className="font-mono">{entry.username}</span>
                    </p>
                    {entry.website && (
                      <p className="truncate">{entry.website}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(entry.username, 'Username');
                  }}
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePassword(entry.id);
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(entry.password, 'Password');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {showPassword && (
              <div className="mt-2 p-2 bg-muted rounded font-mono text-sm border">
                {entry.password}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{entry.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface SortableFolderProps {
  folder: VaultFolder;
  isSelected: boolean;
  entryCount: number;
  onClick: (e?: React.MouseEvent) => void;
  onEdit: (folder: VaultFolder) => void;
  onDelete: (id: string) => void;
}

interface FolderMenuProps {
  folder: VaultFolder;
  onRename: (folder: VaultFolder) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface FolderDropZoneProps {
  folder: VaultFolder;
  isSelected: boolean;
  entryCount: number;
  onClick: (e?: React.MouseEvent) => void;
  onEdit: (folder: VaultFolder) => void;
  onDelete: (id: string) => void;
  isOver: boolean;
}

const FolderMenu: React.FC<FolderMenuProps> = ({ folder, onRename, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background border border-foreground/20 rounded-lg p-6 w-72 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-center">{folder.name}</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
            onClick={() => {
              onRename(folder);
              onClose();
            }}
          >
            Rename Folder
          </Button>
          <Button
            variant="outline"
            className="w-full border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
            onClick={() => {
              onDelete(folder.id);
              onClose();
            }}
          >
            Delete Folder
          </Button>
        </div>
      </div>
    </div>
  );
};

const FolderDropZone: React.FC<FolderDropZoneProps> = ({
  folder,
  isSelected,
  entryCount,
  onClick,
  onEdit,
  onDelete,
  isOver,
}) => {
  const isMobile = useIsMobile();
  const { setNodeRef } = useDroppable({
    id: `folder-drop-${folder.id}`,
  });

  return (
    <div ref={setNodeRef} className="relative w-full h-full">
      <Button
        variant={isSelected ? "vault-primary" : "vault"}
        className={`w-full h-full flex-col p-3 min-w-[80px] group relative transition-all duration-200 ease-in-out ${
          isOver ? 'ring-2 ring-vault-outline-active bg-vault-hover border-vault-outline-active shadow-xl' : ''
        } ${isSelected ? 'shadow-lg border-2 border-vault-outline-active' : 'border-vault-outline hover:border-vault-outline-hover hover:shadow-lg'}`}
        onClick={onClick}
      >
        <div className="relative">
          <Folder className={`w-8 h-8 mb-2 transition-all duration-300 ${
            isOver ? 'animate-bounce' : ''
          } ${isSelected ? 'text-vault-outline-active' : 'text-vault-outline group-hover:text-vault-outline-hover'}`} />
          {entryCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-vault-primary text-vault-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {entryCount}
            </div>
          )}
        </div>
        <span className="text-xs truncate max-w-full font-medium">{folder.name}</span>
        
        <div className={`absolute top-1 right-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(folder);
            }}
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </Button>
    </div>
  );
};

const SortableFolder: React.FC<SortableFolderProps & { isOver: boolean }> = ({
  folder,
  isSelected,
  entryCount,
  onClick,
  onEdit,
  onDelete,
  isOver,
}) => {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: folder.id,
    disabled: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.2s ease',
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-[80px]">
      <div className="relative w-full h-full">
        <div 
          className="absolute top-1 left-1 z-10 cursor-grab active:cursor-grabbing p-1 bg-background/80 rounded"
          {...attributes} 
          {...listeners}
        >
          <DragHandle className="text-muted-foreground" />
        </div>
        <div className="w-full h-full">
          <FolderDropZone
            folder={folder}
            isSelected={isSelected}
            entryCount={entryCount}
            onClick={handleClick}
            onEdit={onEdit}
            onDelete={onDelete}
            isOver={isOver}
          />
        </div>
      </div>
    </div>
  );
};

const Vault: React.FC = () => {
  const { data, lock, deleteEntry, reorderEntries, reorderFolders, createFolder, deleteFolder, moveEntryToFolder, updateFolder } = useVault();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<VaultFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    
    let entries = data.entries;
    
    // Filter by folder - "All" shows everything, specific folder shows only that folder's entries
    if (selectedFolder) {
      entries = entries.filter(entry => entry.folderId === selectedFolder);
    }
    // Note: "All" folder shows all entries regardless of folderId
    
    // Filter by search term
    if (searchTerm) {
      entries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.website && entry.website.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return entries.sort((a, b) => a.order - b.order);
  }, [data, selectedFolder, searchTerm]);

  const sortedFolders = useMemo(() => {
    if (!data) return [];
    return [...data.folders].sort((a, b) => a.order - b.order);
  }, [data]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    toast({
      title: success ? "Copied!" : "Failed to copy",
      description: success ? `${label} copied to clipboard` : "Please copy manually",
    });
  };

  const handleLogout = () => {
    lock();
    navigate('/');
  };

  const handleEditEntry = (entry: VaultEntry) => {
    navigate(`/add-entry?edit=${entry.id}`);
  };

  const handleDeleteEntry = async (id: string) => {
    const success = await deleteEntry(id);
    toast({
      title: success ? "Entry Deleted" : "Error",
      description: success ? "Entry has been deleted" : "Failed to delete entry",
      variant: success ? "default" : "destructive",
    });
  };

  const handleTogglePassword = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const handleCreateFolder = () => {
    setNewFolderName('');
    setCreateFolderDialogOpen(true);
  };

  const handleConfirmCreateFolder = async () => {
    if (newFolderName?.trim()) {
      // Check for duplicate names
      const trimmedName = newFolderName.trim();
      const existingFolder = data?.folders.find(f => f.name.toLowerCase() === trimmedName.toLowerCase());
      
      if (existingFolder) {
        toast({
          title: "Duplicate Name",
          description: "A folder with this name already exists. Please choose a different name.",
          variant: "destructive",
        });
        return;
      }
      
      const success = await createFolder(trimmedName);
      toast({
        title: success ? "Folder Created" : "Error",
        description: success ? "New folder created" : "Failed to create folder",
        variant: success ? "default" : "destructive",
      });
      
      if (success) {
        setCreateFolderDialogOpen(false);
        setNewFolderName('');
      }
    }
  };

  const handleDeleteFolder = (id: string) => {
    setFolderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleRenameFolder = (folder: VaultFolder) => {
    setFolderToRename(folder);
    setRenameFolderName(folder.name);
    setRenameFolderDialogOpen(true);
  };

  const handleConfirmRenameFolder = async () => {
    if (folderToRename && renameFolderName?.trim()) {
      // Check for duplicate names (excluding current folder)
      const trimmedName = renameFolderName.trim();
      const existingFolder = data?.folders.find(f => 
        f.id !== folderToRename.id && f.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (existingFolder) {
        toast({
          title: "Duplicate Name",
          description: "A folder with this name already exists. Please choose a different name.",
          variant: "destructive",
        });
        return;
      }
      
      const success = await updateFolder(folderToRename.id, trimmedName);
      toast({
        title: success ? "Folder Renamed" : "Error",
        description: success ? "Folder renamed successfully" : "Failed to rename folder",
        variant: success ? "default" : "destructive",
      });
      
      if (success) {
        setRenameFolderDialogOpen(false);
        setFolderToRename(null);
        setRenameFolderName('');
      }
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (folderToDelete) {
      const success = await deleteFolder(folderToDelete);
      if (selectedFolder === folderToDelete) {
        setSelectedFolder(null);
      }
      toast({
        title: success ? "Folder Deleted" : "Error",
        description: success ? "Folder deleted successfully" : "Failed to delete folder",
        variant: success ? "default" : "destructive",
      });
      
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    // Handle entry being dropped into a folder
    if (typeof over.id === 'string' && over.id.startsWith('folder-drop-')) {
      const folderId = over.id.replace('folder-drop-', '');
      const entryId = active.id as string;
      
      // Check if it's an entry being dragged (look in all entries, not just filtered ones)
      if (data?.entries.find(e => e.id === entryId)) {
        const success = await moveEntryToFolder(entryId, folderId);
        if (success) {
          toast({
            title: "Entry Moved",
            description: "Entry has been moved to the folder",
          });
        }
        return;
      }
    }

    // Handle folder reordering
    if (data?.folders.find(f => f.id === active.id)) {
      const activeIndex = sortedFolders.findIndex(f => f.id === active.id);
      let newIndex = sortedFolders.findIndex(f => f.id === over.id);
      
      // If dropping over a folder drop zone, get the actual folder id
      if (typeof over.id === 'string' && over.id.startsWith('folder-drop-')) {
        const folderId = over.id.replace('folder-drop-', '');
        newIndex = sortedFolders.findIndex(f => f.id === folderId);
      }
      
      if (activeIndex !== newIndex && newIndex !== -1) {
        const newFolders = arrayMove(sortedFolders, activeIndex, newIndex);
        reorderFolders(newFolders);
      }
      return;
    }

    // Handle entry reordering within the same context
    if (data?.entries.find(e => e.id === active.id)) {
      const activeIndex = filteredEntries.findIndex(e => e.id === active.id);
      const newIndex = filteredEntries.findIndex(e => e.id === over.id);
      
      if (activeIndex !== newIndex && newIndex !== -1) {
        const newEntries = arrayMove(filteredEntries, activeIndex, newIndex);
        reorderEntries(newEntries);
      }
    }
  };

  const getFolderEntryCount = (folderId: string) => {
    return data?.entries.filter(e => e.folderId === folderId).length || 0;
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 vault-fade-in">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">OfflineVault</h1>
              <p className="text-sm text-muted-foreground">
                {data.entries.length} entries • {data.folders.length} folders
              </p>
            </div>
          </div>
          <Button variant="vault" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Lock Vault
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 vault-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-vault-outline focus:border-vault-outline-active"
            />
          </div>
        </div>

        {/* Single DndContext for both folders and entries */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Folders */}
          <div className="mb-6 vault-slide-up" style={{ marginTop: '1px' }}>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
              <Button
                variant={selectedFolder === null ? "vault-primary" : "vault"}
                className="flex-col h-auto p-3 min-w-[80px] flex-shrink-0"
                onClick={() => setSelectedFolder(null)}
              >
                <Folder className={`w-6 h-6 mb-1 ${selectedFolder === null ? 'text-vault-outline-active' : ''}`} />
                <span className="text-xs">All</span>
              </Button>

              <SortableContext
                items={sortedFolders.map(f => f.id)}
                strategy={horizontalListSortingStrategy}
              >
                {sortedFolders.map((folder) => (
                  <SortableFolder
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolder === folder.id}
                    entryCount={getFolderEntryCount(folder.id)}
                    onClick={() => setSelectedFolder(
                      selectedFolder === folder.id ? null : folder.id
                    )}
                     onEdit={(folder) => setFolderMenuOpen(folder.id)}
                     onDelete={handleDeleteFolder}
                    isOver={overId === `folder-drop-${folder.id}`}
                  />
                ))}
              </SortableContext>

              <Button
                variant="vault"
                className="flex-col h-auto p-3 min-w-[80px] flex-shrink-0"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="w-6 h-6 mb-1" />
                <span className="text-xs">New</span>
              </Button>
            </div>
          </div>

          {/* Add Entry Button */}
          <div className="mb-6 text-center vault-slide-up">
            <Button
              variant="vault-primary"
              size="lg"
              onClick={() => navigate(`/add-entry${selectedFolder ? `?folder=${selectedFolder}` : ''}`)}
              className="w-full max-w-md"
            >
              <Plus className="w-5 h-5" />
              Add New Entry
            </Button>
          </div>

          {/* Entries */}
          <div className="vault-slide-up">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-vault-outline flex items-center justify-center">
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No entries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Add your first password entry to get started'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    variant="vault"
                    onClick={() => navigate('/add-entry')}
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </Button>
                )}
              </div>
            ) : (
              <SortableContext
                items={filteredEntries.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <SortableEntry
                      key={entry.id}
                      entry={entry}
                      onCopy={handleCopy}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteEntry}
                      onTogglePassword={handleTogglePassword}
                      showPassword={visiblePasswords.has(entry.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>

          {/* Simplified DragOverlay - no animation effects */}
          <DragOverlay>
            {activeId ? (
              <div>
                {/* Render folder or entry being dragged */}
                {sortedFolders.find(f => f.id === activeId) ? (
                  <Button variant="vault-primary" className="flex-col h-auto p-3 min-w-[80px] shadow-vault-hover">
                    <Folder className="w-6 h-6 mb-1" />
                    <span className="text-xs truncate max-w-full">
                      {sortedFolders.find(f => f.id === activeId)?.name}
                    </span>
                  </Button>
                ) : (
                  <Card className="border-vault-outline-active shadow-vault-hover bg-background">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium truncate">
                          {filteredEntries.find(e => e.id === activeId)?.title || 'Entry'}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Delete Folder Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-background border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Delete Folder</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this folder? All entries will be moved to the main vault.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-background border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDeleteFolder}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
          <DialogContent className="sm:max-w-md bg-background border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Folder</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a name for your new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-background border-border text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmCreateFolder();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCreateFolderDialogOpen(false)}
                className="bg-background border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmCreateFolder}
                disabled={!newFolderName.trim()}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Folder Dialog */}
        <Dialog open={renameFolderDialogOpen} onOpenChange={setRenameFolderDialogOpen}>
          <DialogContent className="sm:max-w-md bg-background border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Rename Folder</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a new name for the folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Folder name"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                className="bg-background border-border text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmRenameFolder();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setRenameFolderDialogOpen(false)}
                className="bg-background border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmRenameFolder}
                disabled={!renameFolderName.trim()}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Folder Menu Popup */}
        {folderMenuOpen && (
          <FolderMenu
            folder={data.folders.find(f => f.id === folderMenuOpen)!}
            onRename={handleRenameFolder}
            onDelete={handleDeleteFolder}
            onClose={() => setFolderMenuOpen(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Vault;