
-- Create RPC function to insert recording metadata
CREATE OR REPLACE FUNCTION public.create_question_recording(
  p_response_id UUID,
  p_question_id TEXT,
  p_recording_url TEXT,
  p_recording_type TEXT,
  p_file_format TEXT,
  p_file_size_bytes BIGINT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recording_id UUID;
BEGIN
  INSERT INTO public.question_recordings (
    response_id,
    question_id,
    recording_url,
    recording_type,
    file_format,
    duration_seconds,
    file_size_bytes
  ) VALUES (
    p_response_id,
    p_question_id,
    p_recording_url,
    p_recording_type,
    p_file_format,
    0, -- Duration will be updated later
    p_file_size_bytes
  )
  RETURNING id INTO recording_id;
  
  RETURN recording_id;
END;
$$;
