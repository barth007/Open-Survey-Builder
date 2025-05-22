
import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragOverEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Folder as FolderIcon, Plus, Trash2, LogOut, Home, File } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./alert-dialog";

// Define proper types directly without importing from Database
type Survey = {
  id: string;
  name: string;
  description: string | null;
  is_published: boolean | null;
  folder_id: string | null;
  order: number | null;
  public_code: string | null;
  created_at: string | null;
  user_id: string | null;
  team_id: string | null;
};

type Folder = {
  id: string;
  name: string;
  order: number | null;
  user_id: string | null;
  created_at: string | null;
};

// Define a simple Profile type with only the fields we need
type Profile = {
  id: string;
  avatar_url: string;
  full_name: string;
  bio: string;
  website: string;
  updated_at: string;
  email?: string;
  role?: string;
  status?: string;
};

// Create a context for the sidebar state
type SidebarContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  collapsedWidth: number;
};

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  setOpen: () => { },
  collapsed: false,
  collapsedWidth: 64
});

// Custom hook to access sidebar state
export function useSidebar() {
  return useContext(SidebarContext);
}

// Provider component for sidebar state
export function SidebarProvider({
  children,
  collapsible = false,
  collapsedWidth = 64,
  defaultOpen = true
}: {
  children: React.ReactNode;
  collapsible?: boolean | "icon";
  collapsedWidth?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{
      open,
      setOpen,
      collapsed: collapsible ? !open : false,
      collapsedWidth
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Main sidebar component
export function Sidebar({
  className,
  collapsible,
  children
}: {
  className?: string;
  collapsible?: boolean | "icon";
  children: React.ReactNode;
}) {
  const { open, setOpen, collapsed } = useSidebar();

  return (
    <aside className={cn(
      "flex flex-col h-full border-r transition-all",
      collapsed ? "w-14" : "w-64",
      className
    )}>
      {children}
    </aside>
  );
}

// Sidebar content component
export function SidebarContent({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

// Sidebar group component
export function SidebarGroup({
  children,
  className,
  defaultOpen,
  open,
  onOpenChange
}: {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true);
  const openState = open !== undefined ? open : isOpen;

  const handleToggle = () => {
    const newState = !openState;
    if (onOpenChange) {
      onOpenChange(newState);
    } else {
      setIsOpen(newState);
    }
  };

  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

// Sidebar group label component
export function SidebarGroupLabel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-sm font-medium px-2 py-1.5 flex justify-between items-center", className)}>
      {children}
    </h3>
  );
}

// Sidebar group content component
export function SidebarGroupContent({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

// Sidebar menu component
export function SidebarMenu({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={cn("", className)}>
      {children}
    </nav>
  );
}

// Sidebar menu item component
export function SidebarMenuItem({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-1", className)}>
      {children}
    </div>
  );
}

// Sidebar menu button component
export function SidebarMenuButton({
  children,
  className,
  asChild = false,
  onClick,
  onDoubleClick
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  if (asChild) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

// Sidebar trigger button component
export function SidebarTrigger({
  className
}: {
  className?: string;
}) {
  const { open, setOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpen(!open)}
      className={cn("p-2 h-8 w-8", className)}
    >
      {open ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      )}
    </Button>
  );
}

// Default export as a function - remove the duplicate implementation by using the named export instead
export default function SidebarComponent() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [surveysByFolder, setSurveysByFolder] = useState<Record<string, Survey[]>>({});
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'folder' | 'survey' } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>("");
  const [editingItemType, setEditingItemType] = useState<'folder' | 'survey' | null>(null);

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  const fetchData = async () => {
    const { data: foldersData } = await supabase.from("folders")
      .select("*")
      .order("order", { ascending: true });

    const { data: surveysData } = await supabase
      .from("surveys")
      .select("*")
      .order("order", { ascending: true });

    const grouped: Record<string, Survey[]> = {};
    surveysData?.forEach((s) => {
      const key = s.folder_id || "null";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ ...s, order: s.order ?? 0 });
    });

    setFolders(foldersData || []);
    setSurveysByFolder(grouped);
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      // Create a profile object with the expected properties
      const profileWithDefaults: Profile = {
        id: data.id,
        avatar_url: data.avatar_url || "",
        full_name: data.full_name || "",
        bio: "", // Default value
        website: "", // Default value
        updated_at: data.updated_at,
        email: data.email || "",
        role: data.role || "user",
        status: data.status || "pending"
      };

      setProfile(profileWithDefaults);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'folder') {
      await supabase.from("folders").delete().eq("id", itemToDelete.id);
    } else {
      await supabase.from("surveys").delete().eq("id", itemToDelete.id);
    }

    fetchData();
    setDeleteDialogOpen(false);
    setItemToDelete(null);

    toast({
      title: `${itemToDelete.type === 'folder' ? 'Folder' : 'Survey'} deleted`,
      variant: "default"
    });
  };

  const handleDeleteRequest = (id: string, type: 'folder' | 'survey') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const findFolderIdForSurvey = (surveyId: string) => {
    return Object.entries(surveysByFolder).find(([_, surveys]) => surveys.find((s) => s.id === surveyId))?.[0];
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let fromFolder = findFolderIdForSurvey(active.id);
    let toFolder = findFolderIdForSurvey(over.id);

    // Handle folder reordering
    if (fromFolder === undefined && toFolder === undefined) {
      const oldIndex = folders.findIndex(f => f.id === active.id);
      const newIndex = folders.findIndex(f => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(folders, oldIndex, newIndex);
        setFolders(reordered);

        // Update order in database
        for (let i = 0; i < reordered.length; i++) {
          await supabase.from("folders").update({ order: i }).eq("id", reordered[i].id);
        }
        return;
      }
    }

    if (!toFolder) toFolder = "null";

    let fromList = [...(surveysByFolder[fromFolder] || [])];
    const oldIndex = fromList.findIndex((s) => s.id === active.id);

    if (fromFolder === toFolder) {
      const newIndex = fromList.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(fromList, oldIndex, newIndex);
      setSurveysByFolder({
        ...surveysByFolder,
        [fromFolder]: reordered,
      });

      for (let i = 0; i < reordered.length; i++) {
        await supabase.from("surveys").update({ order: Number(i) }).eq("id", reordered[i].id);
      }
    } else {
      const survey = fromList.splice(oldIndex, 1)[0];
      survey.folder_id = toFolder === "null" ? null : toFolder;

      const toList = [...(surveysByFolder[toFolder] || []), survey];
      setSurveysByFolder({
        ...surveysByFolder,
        [fromFolder]: fromList,
        [toFolder]: toList,
      });

      await supabase.from("surveys").update({ folder_id: survey.folder_id }).eq("id", survey.id);
    }
  };

  const handleEditItem = (id: string, name: string, type: 'folder' | 'survey') => {
    setEditingItemId(id);
    setEditingItemName(name);
    setEditingItemType(type);
  };

  const handleSaveEdit = async () => {
    if (!editingItemId || !editingItemType) return;

    if (editingItemType === 'folder') {
      await supabase.from("folders").update({ name: editingItemName }).eq("id", editingItemId);
    } else {
      await supabase.from("surveys").update({ name: editingItemName }).eq("id", editingItemId);
    }

    setEditingItemId(null);
    setEditingItemName("");
    setEditingItemType(null);
    fetchData();
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName("");
    setEditingItemType(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    const draggingId = active.id;

    // Check if dragging a survey over a folder
    if (
      surveysByFolder[draggingId] === undefined && // active is a survey
      folders.find(f => f.id === overId) && // over is a folder
      openFolders[overId] === false
    ) {
      setOpenFolders(prev => ({
        ...prev,
        [overId]: true
      }));
    }
  };

  const handleAddSurvey = async () => {
    const { data, error } = await supabase.from("surveys").insert({
      name: "Untitled survey",
      order: 0,
      description: "",
      is_published: false,
      questions: []
    }).select();

    if (!error && data?.[0]) {
      toast({ title: "Survey created" });
      fetchData();
    } else {
      toast({
        title: "Error",
        description: "Could not create survey",
        variant: "destructive"
      });
    }
  };

  const handleAddFolder = async () => {
    const { error } = await supabase.from("folders").insert({
      name: "Untitled folder",
      order: folders.length // Set order to end of list
    });

    if (!error) {
      toast({ title: "Folder created" });
      fetchData();
    } else {
      toast({
        title: "Error",
        description: "Could not create folder",
        variant: "destructive"
      });
    }
  };

  const SortableFolder = ({ folder }: { folder: Folder }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: folder.id });
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
    };

    const isEditing = editingItemId === folder.id;

    return (
      <div key={folder.id} className="mb-2" ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div
          className="flex items-center justify-between group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpenFolders(prev => ({
              ...prev,
              [folder.id]: !prev[folder.id]
            }));
          }}
        >
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="flex items-center gap-1 flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderIcon className="w-4 h-4" />
              <Input
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                onBlur={handleSaveEdit}
                autoFocus
                className="bg-transparent h-7 text-sm w-full"
              />
            </form>
          ) : (
            <h2
              className="flex items-center gap-1 text-sm font-medium"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleEditItem(folder.id, folder.name, 'folder');
              }}
            >
              <FolderIcon className="w-4 h-4" />
              {folder.name}
            </h2>
          )}

          <div className="opacity-0 group-hover:opacity-100 transition">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRequest(folder.id, 'folder');
                    }}

                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {openFolders[folder.id] !== false && (
          <SortableContext
            items={(surveysByFolder[folder.id] || []).map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="pl-4 mt-1 space-y-1">
              {(surveysByFolder[folder.id] || []).map((survey) => (
                <SortableSurveyItem
                  key={survey.id}
                  survey={survey}
                  onDelete={() => handleDeleteRequest(survey.id, 'survey')}
                  onEdit={() => handleEditItem(survey.id, survey.name, 'survey')}
                  isEditing={editingItemId === survey.id}
                  editingName={editingItemName}
                  setEditingName={setEditingItemName}
                  onSaveEdit={handleSaveEdit}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    );
  };

  interface SortableSurveyItemProps {
    survey: Survey;
    onDelete: () => void;
    onEdit: () => void;
    isEditing: boolean;
    editingName: string;
    setEditingName: (name: string) => void;
    onSaveEdit: () => void;
  }

  const SortableSurveyItem = ({
    survey,
    onDelete,
    onEdit,
    isEditing,
    editingName,
    setEditingName,
    onSaveEdit
  }: SortableSurveyItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: survey.id });
    const navigate = useNavigate();

    // Create our own style object for transform
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="pl-1 py-1 hover:bg-accent rounded flex justify-between items-center group"
        onClick={(e) => {
          if (!isEditing) {
            navigate(`/survey/${survey.id}`);
          }
        }}
      >

        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveEdit();
            }}
            className="flex-1 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <File className="h-3.5 w-3.5 flex-shrink-0" />
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={onSaveEdit}
              autoFocus
              className="bg-transparent h-7 text-xs w-full"
            />
          </form>
        ) : (
          <span
            className="truncate flex items-center gap-1.5 text-sm"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <File className="h-3.5 w-3.5 flex-shrink-0" />
            {survey.name}
          </span>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}

              >
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete survey</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <aside className="w-64 border-r h-full flex flex-col overflow-y-auto p-2">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-semibold text-blue-600 flex items-center gap-1"
        >
          <Home size={16} /> Dashboard
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        {/* Folders section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Folders</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAddFolder} size="icon" variant="ghost" className="h-6 w-6">
                    <Plus size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <SortableContext
            items={folders.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {folders.map((folder) => (
              <SortableFolder key={folder.id} folder={folder} />
            ))}
          </SortableContext>
        </div>

        {/* Surveys section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Surveys</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAddSurvey} size="icon" variant="ghost" className="h-6 w-6">
                    <Plus size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create survey</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <SortableContext
            items={(surveysByFolder["null"] || []).map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {(surveysByFolder["null"] || []).map((survey) => (
                <SortableSurveyItem
                  key={survey.id}
                  survey={survey}
                  onDelete={() => handleDeleteRequest(survey.id, 'survey')}
                  onEdit={() => handleEditItem(survey.id, survey.name, 'survey')}
                  isEditing={editingItemId === survey.id}
                  editingName={editingItemName}
                  setEditingName={setEditingItemName}
                  onSaveEdit={handleSaveEdit}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>

      {/* User profile section */}
      <div className="mt-auto pt-4 border-t">
        {profile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-between group">
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt="avatar"
                className="w-6 h-6 rounded-full border"
              />
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm text-foreground">{profile.full_name || "User"}</span>
                <span className="text-muted-foreground text-xs">{profile.email || ""}</span>
              </div>
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    <LogOut size={16} className="text-red-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Confirmation dialog for delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {itemToDelete?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

