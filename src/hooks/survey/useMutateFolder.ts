
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export function useMutateFolder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createFolder = useMutation({
    mutationFn: async (name: string) => {
      if (!user) {
        throw new Error('You must be logged in to create folders');
      }

      try {
        const { data, error } = await supabase
          .from('folders')
          .insert([{ name, user_id: user.id }])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            throw new Error('A folder with this name already exists');
          } else if (error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database. Please create the required tables first.");
          }
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('No data returned from folder creation');
        }
        
        return data;
      } catch (err) {
        console.error("Error in createFolderMutation:", err);
        toast("Failed to create folder", { description: err instanceof Error ? err.message : "Unknown error" });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast("Folder created", { description: "Your folder has been created successfully" });
    }
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete folders');
      }

      try {
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', folderId)
          .eq('user_id', user.id);

        if (error) {
          if (error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database");
          }
          throw new Error(`Database error: ${error.message}`);
        }
      } catch (err) {
        console.error("Error in deleteFolderMutation:", err);
        toast("Failed to delete folder", { description: err instanceof Error ? err.message : "Unknown error" });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast("Folder deleted", { description: "Your folder has been deleted" });
    }
  });

  return {
    createFolder: createFolder.mutateAsync,
    deleteFolder: deleteFolder.mutate
  };
}
