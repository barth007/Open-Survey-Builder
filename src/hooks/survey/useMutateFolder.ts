import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export function useMutateFolder() {
  const queryClient = useQueryClient();

  const createFolder = useMutation({
    mutationFn: async (name: string) => (
      apiFetch('/surveys/folders', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Folder created', { description: 'Your folder has been created successfully' });
    },
    onError: (error: Error) => {
      toast.error('Failed to create folder', { description: error.message || 'Unknown error' });
    },
  });

  const updateFolder = useMutation({
    mutationFn: async ({ folderId, name, order }: { folderId: string; name?: string; order?: number }) => (
      apiFetch(`/surveys/folders/${folderId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, order }),
      })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Folder updated', { description: 'Your folder has been updated successfully' });
    },
    onError: (error: Error) => {
      toast.error('Failed to update folder', { description: error.message || 'Unknown error' });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => (
      apiFetch(`/surveys/folders/${folderId}`, {
        method: 'DELETE',
      })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Folder deleted', { description: 'Your folder has been deleted' });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete folder', { description: error.message || 'Unknown error' });
    },
  });

  return {
    createFolder: createFolder.mutateAsync,
    updateFolder: updateFolder.mutateAsync,
    deleteFolder: deleteFolder.mutateAsync,
  };
}
