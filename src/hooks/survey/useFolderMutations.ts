import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export function useFolderMutations() {
    const queryClient = useQueryClient();

    const createFolder = useMutation({
        mutationFn: async (name: string) => {
            return apiFetch('/surveys/folders', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
            toast("Folder created successfully");
        }
    });

    const updateFolder = useMutation({
        mutationFn: async ({ folderId, name, order }: { folderId: string, name?: string, order?: number }) => {
            return apiFetch(`/surveys/folders/${folderId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, order }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        }
    });

    const deleteFolder = useMutation({
        mutationFn: async (folderId: string) => {
            return apiFetch(`/surveys/folders/${folderId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
            toast("Folder deleted successfully");
        }
    });

    return {
        createFolder: createFolder.mutateAsync,
        updateFolder: updateFolder.mutateAsync,
        deleteFolder: deleteFolder.mutateAsync
    };
}
