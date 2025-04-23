
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import type { Survey, SurveyFolder } from '@/types/survey-organization';

export function useSurveyData() {
  const queryClient = useQueryClient();

  const { data: surveyData, isLoading, error: queryError } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const [foldersResult, surveysResult] = await Promise.all([
          supabase.from('folders').select('*').order('created_at', { ascending: true }),
          supabase.from('surveys').select('*').order('created_at', { ascending: true })
        ]);
        
        // Check for specific errors related to missing tables
        if (foldersResult.error && foldersResult.error.message?.includes("relation \"public.folders\" does not exist")) {
          throw new Error("The folders table doesn't exist in the Supabase database. Please create the required tables first.");
        }
        
        if (surveysResult.error && surveysResult.error.message?.includes("relation \"public.surveys\" does not exist")) {
          throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
        }
        
        // Check for any other errors
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

        const organizedFolders = folders.map(folder => ({
          ...folder,
          surveys: surveys.filter(survey => survey.folderId === folder.id)
        }));

        const unorganizedSurveys = surveys.filter(survey => !survey.folderId);

        return {
          folders: organizedFolders,
          unorganizedSurveys
        };
      } catch (err) {
        console.error("Error fetching survey data:", err);
        throw err;
      }
    }
  });

  const createFolderMutation = useMutation({
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

  const createSurveyMutation = useMutation({
    mutationFn: async ({ name, folderId }: { name: string, folderId?: string }) => {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .insert([{
            name,
            folder_id: folderId,
            description: '',
            questions: [],
            is_published: false
          }])
          .select()
          .single();

        if (error) {
          console.error("Supabase error details:", error);
          if (error.code === '23503') {
            throw new Error('The selected folder does not exist');
          } else if (error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
          }
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          throw new Error('No data returned from survey creation');
        }

        return data;
      } catch (err) {
        console.error("Error in createSurveyMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: async (surveyId: string) => {
      try {
        const { error } = await supabase
          .from('surveys')
          .delete()
          .eq('id', surveyId);

        if (error) {
          if (error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database");
          }
          throw new Error(`Database error: ${error.message}`);
        }
      } catch (err) {
        console.error("Error in deleteSurveyMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  const deleteFolderMutation = useMutation({
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

  const updateSurveyOrder = async (activeId: string, overId: string) => {
    console.log(`Moving survey ${activeId} to position of ${overId}`);
    queryClient.invalidateQueries({ queryKey: ['surveys'] });
  };

  return {
    surveyData,
    isLoading,
    error: queryError,
    createFolder: createFolderMutation.mutateAsync,
    createSurvey: createSurveyMutation.mutateAsync,
    deleteSurvey: deleteSurveyMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    updateSurveyOrder
  };
}
