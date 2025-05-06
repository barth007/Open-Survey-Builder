
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { performDeepSessionValidation } from '@/services/team/teamAuthService';

export function useMutateFolder() {
  const queryClient = useQueryClient();
  const { user, refreshSession } = useAuth();

  const createFolder = useMutation({
    mutationFn: async (name: string) => {
      if (!user) {
        throw new Error('You must be logged in to create folders');
      }

      try {
        // Ensure session is fresh
        await refreshSession();
        
        // Perform deep session validation
        await performDeepSessionValidation();
        
        console.log('Creating folder with name:', name, 'for user:', user.id);
        
        const { data, error } = await supabase
          .from('folders')
          .insert([{ name }])
          .select()
          .single();

        if (error) {
          console.error('Folder creation error:', error);
          if (error.code === '23505') {
            throw new Error('A folder with this name already exists');
          } else if (error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database. Please create the required tables first.");
          } else if (error.message?.includes("violates row-level security policy")) {
            throw new Error("Authentication error: Please sign out and sign in again to refresh your session.");
          }
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('No data returned from folder creation');
        }
        
        console.log('Folder created successfully:', data);
        return data;
      } catch (err) {
        console.error("Error in createFolderMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success("Folder created", { description: "Your folder has been created successfully" });
    },
    onError: (error: Error) => {
      toast.error("Failed to create folder", { description: error.message || "Unknown error" });
    }
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete folders');
      }

      try {
        // Ensure session is fresh
        await refreshSession();
        
        // Perform deep session validation
        await performDeepSessionValidation();
        
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', folderId);

        if (error) {
          if (error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database");
          } else if (error.message?.includes("violates row-level security policy")) {
            throw new Error("Authentication error: Please sign out and sign in again to refresh your session.");
          }
          throw new Error(`Database error: ${error.message}`);
        }
      } catch (err) {
        console.error("Error in deleteFolderMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success("Folder deleted", { description: "Your folder has been deleted" });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete folder", { description: error.message || "Unknown error" });
    }
  });

  return {
    createFolder: createFolder.mutateAsync,
    deleteFolder: deleteFolder.mutate
  };
}
