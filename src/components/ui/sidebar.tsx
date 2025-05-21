import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react"; // or any other trash icon you prefer

type SidebarContextType = { open: boolean; setOpen: (open: boolean) => void };
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

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
  folder_id: string;
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { id: activeSurveyId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedFolderId");
    if (saved) setSelectedFolderId(saved);
  }, []);

  useEffect(() => {
    if (selectedFolderId) localStorage.setItem("selectedFolderId", selectedFolderId);
  }, [selectedFolderId]);

  useEffect(() => {
    supabase.from("folders").select("*").then(({ data }) => {
      if (data) {
        setFolders(data);
        if (!selectedFolderId && data.length > 0) {
          setSelectedFolderId(data[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedFolderId) return;
    supabase
      .from("surveys")
      .select("*")
      .eq("folder_id", selectedFolderId)
      .then(({ data }) => {
        if (data) {
          setSurveys(
            data.map((survey) => ({
              id: survey.id,
              title: survey.name,
              folder_id: survey.folder_id,
            }))
          );
        }
      });
  }, [selectedFolderId]);

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

  const handleNewFolder = async () => {
    const { data, error } = await supabase.from("folders").insert({ name: "Untitled Folder" }).select().single();
    if (!error && data) {
      setFolders((prev) => [...prev, data]);
      setSelectedFolderId(data.id);
      toast({ title: "Folder created", description: `Created "${data.name}"` });
    }
  };

  const handleNewSurvey = async () => {
    if (!selectedFolderId) return;
    const { data, error } = await supabase
      .from("surveys")
      .insert({ name: "Untitled Survey", folder_id: selectedFolderId })
      .select()
      .single();
    if (!error && data) {
      setSurveys((prev) => [
        ...prev,
        {
          id: data.id,
          title: data.name || "Untitled Survey",
          folder_id: data.folder_id,
        },
      ]);
      navigate(`/survey/${data.id}`);
      toast({ title: "Survey created", description: `Created "${data.name}"` });
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    const dependent = surveys.filter(s => s.folder_id === folder.id);
    if (dependent.length > 0) {
      toast({
        variant: "destructive",
        title: "Folder not empty",
        description: `Please delete the ${dependent.length} survey(s) inside first.`,
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete folder "${folder.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("folders").delete().eq("id", folder.id);
    if (!error) {
      setFolders(prev => prev.filter(f => f.id !== folder.id));
      if (selectedFolderId === folder.id && folders.length > 0) {
        setSelectedFolderId(folders[0]?.id ?? null);
      }
      toast({ title: "Folder deleted", description: `"${folder.name}" was removed.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete folder." });
    }
  };

  const handleDeleteSurvey = async (survey: Survey) => {
    const confirmed = window.confirm(`Are you sure you want to delete survey "${survey.title}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("surveys").delete().eq("id", survey.id);
    if (!error) {
      setSurveys(prev => prev.filter(s => s.id !== survey.id));
      toast({ title: "Survey deleted", description: `"${survey.title}" was removed.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete survey." });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between border-r bg-white p-4 text-sm">
      <div className="space-y-6 overflow-auto">
        {/* Folders */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase">Folders</h2>
            <button onClick={handleNewFolder} className="text-xs text-blue-600 hover:underline">+ New</button>
          </div>
          <ul className="space-y-1">
            {folders.map((folder) => (
              <li key={folder.id} className="flex items-center justify-between">
                <button
                  className={cn(
                    "flex-1 text-left px-2 py-1 rounded hover:bg-muted transition",
                    selectedFolderId === folder.id ? "bg-muted font-semibold" : "text-muted-foreground"
                  )}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  {folder.name}
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder)}
                  className="text-muted-foreground hover:text-red-500 p-1"
                  title={`Delete folder ${folder.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Surveys */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase">Surveys</h2>
            <button onClick={handleNewSurvey} className="text-xs text-blue-600 hover:underline">+ New</button>
          </div>
          <ul className="space-y-1">
            {surveys.map((survey) => (
              <li key={survey.id} className="flex items-center justify-between">
                <a
                  href={`/survey/${survey.id}`}
                  className={cn(
                    "flex-1 block px-2 py-1 rounded truncate transition",
                    survey.id === activeSurveyId
                      ? "bg-blue-100 text-blue-800 font-semibold"
                      : "hover:bg-muted text-blue-600"
                  )}
                >
                  {survey.title || "Untitled Survey"}
                </a>
                <button
                  onClick={() => handleDeleteSurvey(survey)}
                  className="text-muted-foreground hover:text-red-500 p-1"
                  title={`Delete survey ${survey.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mt-6 pt-4 border-t flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded transition"
          >
            <div className="w-8 h-8 rounded-full bg-muted text-center font-bold text-sm flex items-center justify-center">
              {user.email?.substring(0, 2).toUpperCase() || "U"}
            </div>
            <div className="truncate text-left">
              <p className="font-medium truncate">{profile?.full_name || user.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || user.email}</p>
            </div>
          </button>
          <button
            onClick={signOut}
            className="text-xs text-muted-foreground hover:underline text-left pl-2"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
