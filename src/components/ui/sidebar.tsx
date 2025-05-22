import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragOverEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Folder as FolderIcon, Plus, Trash2, Pencil, LogOut, Home, MoreVertical } from "lucide-react";
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
import type { Database } from "@/types/database";

// Define proper types using the Database type definitions
type Survey = Database["public"]["Tables"]["surveys"]["Row"];
type Folder = Database["public"]["Tables"]["folders"]["Row"];

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
    <h3 className={cn("text-sm font-medium px-2 py-1.5", className)}>
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
  const [newFolderName, setNewFolderName] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  const fetchData = async () => {
    const { data: foldersData } = await supabase.from("folders").select("*");
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

  const handleDeleteFolder = async (id: string) => {
    const confirmed = confirm("Vuoi davvero eliminare questa cartella?");
    if (!confirmed) return;
    await supabase.from("folders").delete().eq("id", id);
    fetchData();
  };

  const findFolderIdForSurvey = (surveyId: string) => {
    return Object.entries(surveysByFolder).find(([_, surveys]) => surveys.find((s) => s.id === surveyId))?.[0];
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let fromFolder = findFolderIdForSurvey(active.id);
    let toFolder = findFolderIdForSurvey(over.id);
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

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>("");


  const handleAddSurvey = async () => {
    const { data, error } = await supabase.from("surveys").insert({
      name: "Nuovo sondaggio",
      order: 0,
      description: "",
      is_published: false,
      questions: []
    }).select();

    if (!error && data?.[0]) {
      toast({ title: "Sondaggio creato" });
      fetchData();
    } else {
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il sondaggio",
        variant: "destructive"
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from("folders").insert({ name: newFolderName });
    if (!error) {
      toast({ title: "Cartella creata" });
      setNewFolderName("");
      fetchData();
    } else {
      toast({
        title: "Errore",
        description: "Non è stato possibile creare la cartella",
        variant: "destructive"
      });
    }
  };

  const handleRenameFolder = async (id: string, currentName: string) => {
    const newName = prompt("Nuovo nome della cartella:", currentName);
    if (newName && newName !== currentName) {
      await supabase.from("folders").update({ name: newName }).eq("id", id);
      fetchData();
    }
  };

  const SortableFolder = ({ folder }: { folder: Folder }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: folder.id });
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
    };

    return (
      <div key={folder.id} className="mb-4" ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div
          className="flex items-center justify-between group cursor-pointer"
          onClick={() => setOpenFolders(prev => ({
            ...prev,
            [folder.id]: !prev[folder.id]
          }))}
        >
          {editingFolderId === folder.id ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await supabase.from("folders").update({ name: editingFolderName }).eq("id", folder.id);
                setEditingFolderId(null);
                fetchData();
              }}
              className="flex items-center gap-1"
            >
              <FolderIcon className="w-4 h-4" />
              <input
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                onBlur={() => setEditingFolderId(null)}
                autoFocus
                className="bg-transparent border-b border-muted text-sm w-full outline-none"
              />
            </form>
          ) : (
            <h2
              className="flex items-center gap-1 text-sm font-semibold"
              onDoubleClick={() => {
                setEditingFolderId(folder.id);
                setEditingFolderName(folder.name);
              }}
            >
              <FolderIcon className="w-4 h-4" />
              {folder.name}
            </h2>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 transition">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleRenameFolder(folder.id, folder.name);
              }}>
                Rinomina
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }} className="text-red-500">
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {openFolders[folder.id] !== false && (
          <SortableContext
            items={(surveysByFolder[folder.id] || []).map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {(surveysByFolder[folder.id] || []).map((survey, index) => (
              <div key={survey.id} onClick={() => navigate(`/survey/${survey.id}`)} className="group">
                <SortableItem survey={{ ...survey, order: Number(survey.order ?? index) }} />
              </div>
            ))}
          </SortableContext>
        )}
      </div>
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    const draggingId = active.id;

    // Se stai trascinando un sondaggio e stai passando su una cartella chiusa
    if (
      surveysByFolder[draggingId] === undefined && // active è un sondaggio
      surveysByFolder[overId] !== undefined &&     // over è una cartella
      openFolders[overId] === false
    ) {
      setOpenFolders(prev => ({
        ...prev,
        [overId]: true
      }));
    }
  };


  const SortableItem = ({ survey }: { survey: Survey }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: survey.id });

    // Create our own style object for transform
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition
    };

    const handleRename = async () => {
      const newName = prompt("Nuovo nome del sondaggio:", survey.name);
      if (newName && newName !== survey.name) {
        await supabase.from("surveys").update({ name: newName }).eq("id", survey.id);
        fetchData();
      }
    };

    const handleDelete = async () => {
      const confirmed = confirm("Sei sicuro di voler eliminare questo sondaggio?");
      if (confirmed) {
        await supabase.from("surveys").delete().eq("id", survey.id);
        fetchData();
        toast({ title: "Sondaggio eliminato" });
      }
    };

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(survey.name ?? "");


    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="pl-4 py-1 cursor-move hover:bg-accent rounded flex justify-between items-center"
      >
        {editing ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await supabase.from("surveys").update({ name }).eq("id", survey.id);
              setEditing(false);
              fetchData();
            }}
            className="flex-1 flex items-center gap-1"
          >
            <span>📄</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
              className="bg-transparent border-b border-muted text-sm w-full outline-none"
            />
          </form>
        ) : (
          <span
            className="truncate flex-1"
            onDoubleClick={() => {
              setEditing(true);
              setName(survey.name ?? "");
            }}
          >
            📄 {survey.name}
          </span>
        )}

        <span className="flex gap-1 pr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Pencil size={14} onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                }} className="cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Rinomina</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Trash2 size={14} onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }} className="cursor-pointer text-red-500" />
              </TooltipTrigger>
              <TooltipContent>Elimina</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
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

      <div className="mb-4 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAddSurvey} size="sm">
                <Plus size={16} className="mr-1" /> Nuovo
              </Button>
            </TooltipTrigger>
            <TooltipContent>Nuovo sondaggio</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex flex-1">
          <Input
            placeholder="Nome cartella"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateFolder} size="sm">
                  <FolderIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Crea cartella</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        {/* Header + controlli */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Sondaggi</h2>
          <div className="flex items-center gap-1">
            <Button onClick={handleAddSurvey} size="sm" variant="outline">
              <Plus size={16} />
            </Button>
            <Input
              placeholder="Nome cartella"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
            />
            <Button onClick={handleCreateFolder} size="sm" variant="outline">
              <FolderIcon size={16} />
            </Button>
          </div>
        </div>

        {/* 📁 Cartelle prima */}
        <SortableContext
          items={folders.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {folders.map((folder) => (
            <SortableFolder key={folder.id} folder={folder} />
          ))}
        </SortableContext>

        {/* 🗂️ Sondaggi senza cartella dopo */}
        <div className="mb-4">
          <div className="flex items-center justify-between group">
            <h2 className="text-sm font-semibold">Senza cartella</h2>
          </div>
          <SortableContext
            items={(surveysByFolder["null"] || []).map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {(surveysByFolder["null"] || []).map((survey, index) => (
              <div
                key={survey.id}
                onClick={() => navigate(`/survey/${survey.id}`)}
                className="group"
              >
                <SortableItem survey={{ ...survey, order: Number(survey.order ?? index) }} />
              </div>
            ))}
          </SortableContext>
        </div>
      </DndContext>


      <div className="mt-auto pt-4 border-t">
        {profile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-between">
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt="avatar"
                className="w-6 h-6 rounded-full border"
              />
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm text-foreground">{profile.full_name || "Utente"}</span>
                <span className="text-muted-foreground text-xs">{profile.email || ""}</span>
              </div>
            </button>
            <button onClick={signOut} className="text-red-500 text-xs flex items-center gap-1">
              <LogOut size={12} /> Esci
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
