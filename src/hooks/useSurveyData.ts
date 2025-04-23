
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import type { Survey, SurveyFolder } from '@/types/survey-organization';

export function useSurveyData() {
  const queryClient = useQueryClient();

  const { data: surveyData, isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const [foldersResult, surveysResult] = await Promise.all([
        supabase.from('folders').select('*').order('created_at', { ascending: true }),
        supabase.from('surveys').select('*').order('created_at', { ascending: true })
      ]);

      if (foldersResult.error) throw foldersResult.error;
      if (surveysResult.error) throw surveysResult.error;

      const folders: SurveyFolder[] = foldersResult.data.map(folder => ({
        id: folder.id,
        name: folder.name,
        createdAt: new Date(folder.created_at),
        surveys: []
      }));

      const surveys = surveysResult.data.map(survey => ({
        id: survey.id,
        name: survey.name,
        createdAt: new Date(survey.created_at),
        folderId: survey.folder_id
      }));

      // Organize surveys into folders
      const organizedFolders = folders.map(folder => ({
        ...folder,
        surveys: surveys.filter(survey => survey.folderId === folder.id)
      }));

      const unorganizedSurveys = surveys.filter(survey => !survey.folderId);

      return {
        folders: organizedFolders,
        unorganizedSurveys
      };
    }
  });

  const createSurveyMutation = useMutation({
    mutationFn: async ({ name, folderId }: { name: string, folderId?: string }) => {
      const { data, error } = await supabase
        .from('surveys')
        .insert([
          {
            name,
            folder_id: folderId,
            description: '',
            questions: [],
            is_published: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: async (surveyId: string) => {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  return {
    surveyData,
    isLoading,
    createSurvey: createSurveyMutation.mutate,
    deleteSurvey: deleteSurveyMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate
  };
}
