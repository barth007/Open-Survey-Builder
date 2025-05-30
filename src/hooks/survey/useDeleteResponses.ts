
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeleteResponses() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteResponsesByParticipant = async (
    surveyId: string,
    participantId?: string,
    participantEmail?: string,
    softDelete: boolean = false,
    deletionReason?: string
  ) => {
    if (!participantId && !participantEmail) {
      throw new Error('Either participant ID or email must be provided');
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_responses_by_participant', {
        p_survey_id: surveyId,
        p_participant_id: participantId || null,
        p_participant_email: participantEmail || null,
        p_soft_delete: softDelete,
        p_deletion_reason: deletionReason || null
      });

      if (error) throw error;

      const deletedCount = data as number;
      
      toast({
        title: "Responses deleted successfully",
        description: `${deletedCount} response${deletedCount !== 1 ? 's' : ''} ${softDelete ? 'hidden' : 'permanently deleted'}.`,
      });

      return deletedCount;
    } catch (error) {
      console.error('Error deleting responses:', error);
      toast({
        title: "Error deleting responses",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteResponsesByParticipant,
    isDeleting
  };
}
