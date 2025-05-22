
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Folder as FolderIcon, Plus, Trash2, Pencil, LogOut, Home } from "lucide-react";
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
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Sidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [surveysByFolder, setSurveysByFolder] = useState<Record<string, Survey[]>>({});
  const [newFolderName, setNewFolderName] = useState("");
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
    
    if (!error && data) setProfile(data);
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

  const SortableItem = ({ survey }: { survey: Survey }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: survey.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

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

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="pl-4 py-1 cursor-move hover:bg-accent rounded flex justify-between items-center"
      >
        <span className="truncate flex-1">📄 {survey.name}</span>
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="mb-4">
          <h2 className="font-semibold text-sm mb-1">Senza cartella</h2>
          <SortableContext
            items={(surveysByFolder["null"] || []).map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {(surveysByFolder["null"] || []).map((survey, index) => (
              <div key={survey.id} onClick={() => navigate(`/survey/${survey.id}`)}>
                <SortableItem survey={{ ...survey, order: Number(survey.order ?? index) }} />
              </div>
            ))}
          </SortableContext>
        </div>

        {folders.map((folder) => (
          <div key={folder.id} className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1 text-sm font-semibold">
                <FolderIcon className="w-4 h-4" /> {folder.name}
              </h2>
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Pencil 
                        size={14} 
                        onClick={() => handleRenameFolder(folder.id, folder.name)} 
                        className="cursor-pointer" 
                      />
                    </TooltipTrigger>
                    <TooltipContent>Rinomina cartella</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Trash2 
                        size={14} 
                        onClick={() => handleDeleteFolder(folder.id)} 
                        className="cursor-pointer text-red-500" 
                      />
                    </TooltipTrigger>
                    <TooltipContent>Elimina cartella</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <SortableContext
              items={(surveysByFolder[folder.id] || []).map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {(surveysByFolder[folder.id] || []).map((survey, index) => (
                <div key={survey.id} onClick={() => navigate(`/survey/${survey.id}`)}>
                  <SortableItem survey={{ ...survey, order: Number(survey.order ?? index) }} />
                </div>
              ))}
            </SortableContext>
          </div>
        ))}
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
