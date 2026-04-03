import { useState } from 'react';

import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useDeleteResponses() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteResponsesByParticipant = async (
    surveyId: string,
    participantId?: string,
    participantEmail?: string,
    softDelete = false,
    deletionReason?: string,
  ) => {
    if (!participantId && !participantEmail) {
      throw new Error('Either participant ID or email must be provided');
    }

    setIsDeleting(true);

    try {
      const result = await apiFetch(`/surveys/${surveyId}/responses`, {
        method: 'DELETE',
        body: JSON.stringify({
          participantId,
          participantEmail,
          softDelete,
          deletionReason,
        }),
      }) as { count: number };

      const deletedCount = result?.count ?? 0;

      toast({
        title: 'Responses deleted successfully',
        description: `${deletedCount} response${deletedCount !== 1 ? 's' : ''} ${softDelete ? 'hidden' : 'permanently deleted'}.`,
      });

      return deletedCount;
    } catch (error) {
      console.error('Error deleting responses:', error);
      toast({
        title: 'Error deleting responses',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteResponsesByParticipant,
    isDeleting,
  };
}
