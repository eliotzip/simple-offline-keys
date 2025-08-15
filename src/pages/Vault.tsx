import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useVault } from '@/contexts/VaultContext';
import { useToast } from '@/hooks/use-toast';
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
  Shield
} from 'lucide-react';
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

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`border-vault-outline hover:border-vault-outline-hover transition-vault-smooth hover:shadow-vault group ${
        isDragging ? 'shadow-vault-hover border-vault-outline-active' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 min-w-0 cursor-grab active:cursor-grabbing" 
              {...attributes} 
              {...listeners}
            >
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
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onCopy(entry.username, 'Username')}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onTogglePassword(entry.id)}
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
                onClick={() => onCopy(entry.password, 'Password')}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(entry)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                onClick={() => onDelete(entry.id)}
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

interface FolderDropZoneProps {
  folder: VaultFolder;
  isSelected: boolean;
  entryCount: number;
  onClick: (e?: React.MouseEvent) => void;
  onEdit: (folder: VaultFolder) => void;
  onDelete: (id: string) => void;
  isOver: boolean;
}

const FolderDropZone: React.FC<FolderDropZoneProps> = ({
  folder,
  isSelected,
  entryCount,
  onClick,
  onEdit,
  onDelete,
  isOver,
}) => {
  const { setNodeRef } = useDroppable({
    id: `folder-drop-${folder.id}`,
  });

  return (
    <div ref={setNodeRef}>
      <Button
        variant={isSelected ? "vault-primary" : "vault"}
        className={`flex-col h-auto p-3 min-w-[80px] group relative transition-vault-smooth ${
          isOver ? 'ring-2 ring-vault-outline-active scale-105 bg-vault-hover' : ''
        }`}
        onClick={onClick}
      >
        <Folder className="w-6 h-6 mb-1" />
                <span className="text-xs truncate max-w-full">{folder.name}</span>
        
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
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
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we're not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
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
  );
};

const Vault: React.FC = () => {
  const { data, lock, deleteEntry, reorderEntries, reorderFolders, createFolder, deleteFolder, moveEntryToFolder } = useVault();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    
    let entries = data.entries;
    
    // Filter by folder
    if (selectedFolder) {
      entries = entries.filter(entry => entry.folderId === selectedFolder);
    } else {
      entries = entries.filter(entry => !entry.folderId);
    }
    
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

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      const success = await createFolder(name.trim());
      toast({
        title: success ? "Folder Created" : "Error",
        description: success ? "New folder created" : "Failed to create folder",
        variant: success ? "default" : "destructive",
      });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (confirm('Delete this folder? Entries will be moved to the main vault.')) {
      const success = await deleteFolder(id);
      if (selectedFolder === id) {
        setSelectedFolder(null);
      }
      toast({
        title: success ? "Folder Deleted" : "Error",
        description: success ? "Folder deleted successfully" : "Failed to delete folder",
        variant: success ? "default" : "destructive",
      });
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
      
      if (filteredEntries.find(e => e.id === entryId)) {
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
    if (sortedFolders.find(f => f.id === active.id)) {
      const oldIndex = sortedFolders.findIndex(f => f.id === active.id);
      const newIndex = sortedFolders.findIndex(f => f.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newFolders = arrayMove(sortedFolders, oldIndex, newIndex);
        reorderFolders(newFolders);
      }
      return;
    }

    // Handle entry reordering
    const oldIndex = filteredEntries.findIndex(e => e.id === active.id);
    const newIndex = filteredEntries.findIndex(e => e.id === over.id);
    
    if (oldIndex !== newIndex) {
      const newEntries = arrayMove(filteredEntries, oldIndex, newIndex);
      reorderEntries(newEntries);
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

        {/* Folders */}
        <div className="mb-6 vault-slide-up">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <DragOverlay>
              {activeId && sortedFolders.find(f => f.id === activeId) ? (
                <div className="opacity-90 transform scale-105 transition-transform">
                  <Button variant="vault-primary" className="flex-col h-auto p-3 min-w-[80px] shadow-vault-hover">
                    <Folder className="w-6 h-6 mb-1" />
                    <span className="text-xs truncate max-w-full">
                      {sortedFolders.find(f => f.id === activeId)?.name}
                    </span>
                  </Button>
                </div>
              ) : null}
            </DragOverlay>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={selectedFolder === null ? "vault-primary" : "vault"}
                className="flex-col h-auto p-3 min-w-[80px]"
                onClick={() => setSelectedFolder(null)}
              >
                <Folder className="w-6 h-6 mb-1" />
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
                    onEdit={() => {}}
                    onDelete={handleDeleteFolder}
                    isOver={overId === `folder-drop-${folder.id}`}
                  />
                ))}
              </SortableContext>

              <Button
                variant="vault"
                className="flex-col h-auto p-3 min-w-[80px]"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="w-6 h-6 mb-1" />
                <span className="text-xs">New</span>
              </Button>
            </div>
          </DndContext>
        </div>

        {/* Add Entry Button */}
        <div className="mb-6 text-center vault-slide-up">
          <Button
            variant="vault-primary"
            size="lg"
            onClick={() => navigate('/add-entry')}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
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
              <DragOverlay>
                {activeId ? (
                  <div className="opacity-90 transform scale-105 transition-transform">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Vault;