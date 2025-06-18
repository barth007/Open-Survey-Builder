
-- Create storage bucket for survey recordings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'survey-recordings') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('survey-recordings', 'survey-recordings', false);
  END IF;
END $$;

-- Create question_recordings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.question_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  recording_url TEXT NOT NULL,
  recording_type TEXT NOT NULL CHECK (recording_type IN ('screen-webcam')),
  file_format TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies for question_recordings
ALTER TABLE public.question_recordings ENABLE ROW LEVEL SECURITY;

-- Users can view recordings for surveys they own
CREATE POLICY "Survey owners can view recordings" 
  ON public.question_recordings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      JOIN public.surveys s ON sr.survey_id = s.id
      WHERE sr.id = response_id AND s.user_id = auth.uid()
    )
  );

-- Public can insert recordings for published surveys (during response submission)
CREATE POLICY "Anyone can create recordings for published surveys" 
  ON public.question_recordings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      JOIN public.surveys s ON sr.survey_id = s.id
      WHERE sr.id = response_id AND s.is_published = true
    )
  );

-- Survey owners can delete recordings
CREATE POLICY "Survey owners can delete recordings" 
  ON public.question_recordings 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      JOIN public.surveys s ON sr.survey_id = s.id
      WHERE sr.id = response_id AND s.user_id = auth.uid()
    )
  );

-- Storage policies for recordings bucket
CREATE POLICY "Survey owners can view recordings" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'survey-recordings' AND
    EXISTS (
      SELECT 1 FROM public.question_recordings qr
      JOIN public.survey_responses sr ON qr.response_id = sr.id
      JOIN public.surveys s ON sr.survey_id = s.id
      WHERE qr.recording_url LIKE '%' || name AND s.user_id = auth.uid()
    )
  );

-- Anyone can upload recordings for published surveys (during response submission)
CREATE POLICY "Anyone can upload recordings for published surveys" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'survey-recordings');

-- Survey owners can delete recordings from storage
CREATE POLICY "Survey owners can delete recordings from storage" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'survey-recordings' AND
    EXISTS (
      SELECT 1 FROM public.question_recordings qr
      JOIN public.survey_responses sr ON qr.response_id = sr.id
      JOIN public.surveys s ON sr.survey_id = s.id
      WHERE qr.recording_url LIKE '%' || name AND s.user_id = auth.uid()
    )
  );
