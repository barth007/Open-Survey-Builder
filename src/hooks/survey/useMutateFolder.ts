
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export function useMutateFolder() {
  const queryClient = useQueryClient();

  const createFolder = useMutation({
    mutationFn: async (name: string) => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .insert([{ name }])
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
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      try {
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', folderId);

        if (error) {
          if (error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database");
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
    }
  });

  return {
    createFolder: createFolder.mutateAsync,
    deleteFolder: deleteFolder.mutate
  };
}
