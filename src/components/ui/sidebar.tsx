import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Trash2, Plus, LogOut, Home, Pencil, FolderDown, Folder as FolderIcon } from "lucide-react";

const SidebarContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
};

interface Folder {
  id: string;
  name: string;
}

interface Survey {
  id: string;
  title: string;
  folder_id: string | null;
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { id: activeSurveyId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    const { data: folderData } = await supabase.from("folders").select("*");
    const { data: surveyData } = await supabase.from("surveys").select("*");
    if (folderData) setFolders(folderData);
    if (surveyData) {
      setSurveys(
        surveyData.map((s: any) => ({
          id: s.id,
          title: s.name || "Untitled Survey",
          folder_id: s.folder_id,
        }))
      );
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const handleRename = async (id: string, type: "folder" | "survey", newName: string) => {
    const table = type === "folder" ? "folders" : "surveys";
    const current = (type === "folder" ? folders : surveys).find((item) => item.id === id);
    if (
      !current ||
      (type === "folder" && (current as Folder).name === newName) ||
      (type === "survey" && (current as Survey).title === newName)
    ) {
      setEditingId(null);
      return;
    }
    await supabase.from(table).update({ name: newName }).eq("id", id);
    toast({ title: `${type} renamed`, description: `"${newName}" saved.` });
    setEditingId(null);
    setNewTitle("");
    fetchSidebarData();
  };

  const handleNewFolder = async () => {
    const { data, error } = await supabase.from("folders").insert([{ name: "Untitled Folder" }]).select().single();
    if (!error && data) {
      toast({ title: "Folder created", description: "A new folder has been added." });
      fetchSidebarData();
    }
  };

  const handleNewSurvey = async () => {
    const { error } = await supabase.from("surveys").insert([{ name: "Untitled Survey", folder_id: null }]);
    if (error) {
      toast({ variant: "destructive", title: "Error creating survey", description: error.message });
    } else {
      fetchSidebarData();
      toast({ title: "Survey created", description: "A new survey has been added." });
    }
  };

  const handleMoveSurvey = async (survey: Survey, newFolderId: string | null) => {
    await supabase.from("surveys").update({ folder_id: newFolderId }).eq("id", survey.id);
    fetchSidebarData();
    toast({ title: "Survey moved" });
  };

  const handleDeleteSurvey = async (survey: Survey) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${survey.title}"?`);
    if (!confirmed) return;
    const { error } = await supabase.from("surveys").delete().eq("id", survey.id).select().single();
    if (!error) {
      setSurveys(prev => prev.filter(s => s.id !== survey.id));
      toast({ title: "Survey deleted", description: `"${survey.title}" removed.` });
      navigate("/dashboard");
    }
  };

  const renderEditableLabel = (
    item: Folder | Survey,
    type: "folder" | "survey",
    selected: boolean = false
  ) => {
    const isEditing = editingId === item.id;
    return isEditing ? (
      <input
        autoFocus
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onBlur={() => handleRename(item.id, type, newTitle)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRename(item.id, type, newTitle);
        }}
        className="px-1 py-0.5 rounded text-sm border border-gray-300 w-full"
      />
    ) : (
      <span
        onClick={() => {
          setEditingId(item.id);
          setNewTitle(type === "folder" ? (item as Folder).name : (item as Survey).title);
        }}
        className={cn(
          "truncate cursor-pointer",
          selected ? "font-semibold text-blue-800" : "text-muted-foreground hover:text-blue-600"
        )}
      >
        {type === "folder" ? (item as Folder).name : (item as Survey).title}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full justify-between border-r bg-white p-4 text-sm">
      <div className="space-y-6 overflow-auto">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold mb-4 cursor-pointer hover:text-blue-600 transition"
             onClick={() => navigate("/dashboard")}>
          <Home size={16} />
          <span className="text-xs uppercase">Dashboard</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 group">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase">Folders</h2>
            <button onClick={handleNewFolder}>
              <Plus size={14} className="text-muted-foreground group-hover:opacity-100 opacity-0" />
            </button>
          </div>
          <ul className="space-y-1">
            {folders.map((folder) => (
              <li key={folder.id}>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <FolderIcon size={14} />
                    {renderEditableLabel(folder, "folder")}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button title="Rename"><Pencil size={14} /></button>
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm(`Are you sure you want to delete folder "${folder.name}"?`);
                        if (!confirmed) return;
                        const dependent = surveys.filter((s) => s.folder_id === folder.id);
                        if (dependent.length > 0) {
                          toast({
                            variant: "destructive",
                            title: "Folder not empty",
                            description: "Please delete surveys first.",
                          });
                          return;
                        }
                        await supabase.from("folders").delete().eq("id", folder.id);
                        setFolders(prev => prev.filter(f => f.id !== folder.id));
                        navigate("/dashboard");
                        toast({ title: "Folder deleted", description: `"${folder.name}" removed.` });
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} className="hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <ul className="ml-2 mt-1 space-y-1">
                  {surveys.filter(s => s.folder_id === folder.id).map((survey) => (
                    <li key={survey.id} className="flex items-center justify-between group">
                      <div
                        onClick={() => {
                          if (editingId !== survey.id) navigate(`/survey/${survey.id}`);
                        }}
                        className={cn(
                          "flex-1 block px-2 py-1 rounded truncate transition cursor-pointer",
                          survey.id === activeSurveyId
                            ? "bg-blue-100 text-blue-800 font-semibold"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {renderEditableLabel(survey, "survey", survey.id === activeSurveyId)}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleMoveSurvey(survey, null)} title="Move to ungrouped">
                          <FolderDown size={14} />
                        </button>
                        <button onClick={() => handleDeleteSurvey(survey)} title="Delete">
                          <Trash2 size={14} className="hover:text-red-500" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 group">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase">Surveys</h2>
            <button onClick={handleNewSurvey} title="New Survey">
              <Plus size={14} className="text-muted-foreground group-hover:opacity-100 opacity-0" />
            </button>
          </div>
          <ul className="space-y-1">
            {surveys.filter(s => !s.folder_id).map((survey) => (
              <li key={survey.id} className="flex items-center justify-between group">
                <div
                  onClick={() => {
                    if (editingId !== survey.id) navigate(`/survey/${survey.id}`);
                  }}
                  className={cn(
                    "flex-1 block px-2 py-1 rounded truncate transition cursor-pointer",
                    survey.id === activeSurveyId
                      ? "bg-blue-100 text-blue-800 font-semibold"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {renderEditableLabel(survey, "survey", survey.id === activeSurveyId)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleDeleteSurvey(survey)} title="Delete">
                    <Trash2 size={14} className="hover:text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {user && (
        <div className="mt-6 pt-4 border-t group relative">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded transition w-full"
          >
            <div className="w-8 h-8 rounded-full bg-muted text-center font-bold text-sm flex items-center justify-center">
              {user.email?.substring(0, 2).toUpperCase() || "U"}
            </div>
            <div className="truncate text-left flex-1">
              <p className="font-medium truncate">{profile?.full_name || user.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </button>
        </div>
      )}
    </div>
  );
}