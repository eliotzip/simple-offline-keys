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
      <Card className={`border-glass-border hover:shadow-glow transition-all duration-300 hover:scale-105 group ${
        isDragging ? 'shadow-glow border-primary scale-105' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 min-w-0 cursor-grab active:cursor-grabbing" 
              {...attributes} 
              {...listeners}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg truncate">{entry.title}</h3>
              </div>
              <div className="space-y-2 text-muted-foreground ml-14">
                <p className="truncate font-mono text-sm">
                  {entry.username}
                </p>
                {entry.website && (
                  <p className="truncate text-sm">{entry.website}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => onCopy(entry.username, 'Username')}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
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
                className="h-10 w-10 rounded-full"
                onClick={() => onCopy(entry.password, 'Password')}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => onEdit(entry)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {showPassword && (
            <div className="mt-4 p-4 glass rounded-xl font-mono text-sm border border-glass-border ml-14">
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
    <div ref={setNodeRef} className="relative w-full h-full">
      <Button
        variant={isSelected ? "primary" : "outline"}
        className={`w-full h-full flex-col p-4 min-w-[100px] rounded-2xl transition-all duration-300 ${
          isOver ? 'ring-2 ring-primary scale-105 shadow-glow' : ''
        }`}
        onClick={onClick}
      >
        <Folder className="w-7 h-7 mb-2" />
        <span className="text-sm font-medium truncate max-w-full">{folder.name}</span>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive rounded-full"
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
    transition: isDragging ? 'none' : transition, // Disable transition while dragging for real-time movement
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 50 : 1,
    scale: isDragging ? '1.05' : '1',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we're not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-[100px]">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing w-full h-full">
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
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full glass border-glass-border flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                OfflineVault
              </h1>
              <p className="text-muted-foreground">
                {data.entries.length} entries • {data.folders.length} folders
              </p>
            </div>
          </div>
          <Button variant="accent" onClick={handleLogout} className="glass-button">
            <LogOut className="w-5 h-5" />
            Lock Vault
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 slide-up">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg"
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
          <div className="mb-8 slide-up">
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-glass">
              <Button
                variant={selectedFolder === null ? "primary" : "outline"}
                className="flex-col h-auto p-4 min-w-[100px] flex-shrink-0 rounded-2xl"
                onClick={() => setSelectedFolder(null)}
              >
                <Folder className="w-7 h-7 mb-2" />
                <span className="text-sm font-medium">All</span>
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
                variant="outline"
                className="flex-col h-auto p-4 min-w-[100px] flex-shrink-0 rounded-2xl border-dashed"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="w-7 h-7 mb-2" />
                <span className="text-sm font-medium">New</span>
              </Button>
            </div>
          </div>

          {/* Add Entry Button */}
          <div className="mb-8 text-center slide-up">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/add-entry')}
              className="w-full max-w-md h-14 text-lg font-semibold rounded-2xl"
            >
              <Plus className="w-6 h-6" />
              Add New Entry
            </Button>
          </div>

          {/* Entries */}
          <div className="slide-up">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass border-glass-border flex items-center justify-center shadow-glow">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No entries found</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Add your first password entry to get started'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    variant="accent"
                    onClick={() => navigate('/add-entry')}
                    className="rounded-2xl"
                  >
                    <Plus className="w-5 h-5" />
                    Add Entry
                  </Button>
                )}
              </div>
            ) : (
              <SortableContext
                items={filteredEntries.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
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

          {/* Single DragOverlay for both folders and entries */}
          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 transform scale-110 transition-transform">
                {/* Render folder or entry being dragged */}
                {sortedFolders.find(f => f.id === activeId) ? (
                  <Button variant="primary" className="flex-col h-auto p-4 min-w-[100px] shadow-glow rotate-3 rounded-2xl">
                    <Folder className="w-7 h-7 mb-2" />
                    <span className="text-sm font-medium truncate max-w-full">
                      {sortedFolders.find(f => f.id === activeId)?.name}
                    </span>
                  </Button>
                ) : (
                  <Card className="border-primary shadow-glow bg-background">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg truncate">
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
      </div>
    </div>
  );
};

export default Vault;