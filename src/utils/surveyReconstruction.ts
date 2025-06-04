
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionOption } from '@/types/survey';

export async function reconstructSurveyQuestions(surveyId: string) {
  // Get the survey responses to analyze the question structure
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('answers')
    .eq('survey_id', surveyId);

  if (responsesError || !responses) {
    throw new Error('Failed to fetch survey responses');
  }

  // Analyze responses to reconstruct questions
  const questionMap = new Map<string, any>();
  
  responses.forEach(response => {
    if (response.answers && Array.isArray(response.answers)) {
      response.answers.forEach((answer: any) => {
        if (!questionMap.has(answer.questionId)) {
          questionMap.set(answer.questionId, {
            id: answer.questionId,
            responses: []
          });
        }
        questionMap.get(answer.questionId).responses.push(answer.value);
      });
    }
  });

  // Reconstruct questions based on the analysis
  const reconstructedQuestions: Question[] = [];

  // Question 1: How often do you exercise?
  if (questionMap.has('question-1')) {
    const options: QuestionOption[] = [
      { id: 'daily', text: 'Daily' },
      { id: 'weekly', text: '2-3 times a week' },
      { id: 'rarely', text: 'Rarely' },
      { id: 'never', text: 'Never' }
    ];

    reconstructedQuestions.push({
      id: 'question-1',
      type: 'multipleChoice',
      text: 'How often do you exercise?',
      description: '',
      isRequired: true,
      options: options
    });
  }

  // Question 2: What types of exercise do you enjoy?
  if (questionMap.has('question-2')) {
    const options: QuestionOption[] = [
      { id: 'running', text: 'Running' },
      { id: 'weightlifting', text: 'Weight lifting' },
      { id: 'yoga', text: 'Yoga' },
      { id: 'swimming', text: 'Swimming' },
      { id: 'cycling', text: 'Cycling' },
      { id: 'dancing', text: 'Dancing' }
    ];

    reconstructedQuestions.push({
      id: 'question-2',
      type: 'checkboxes',
      text: 'What types of exercise do you enjoy? (Select all that apply)',
      description: '',
      isRequired: false,
      options: options,
      maxSelections: 6
    });
  }

  // Question 3: Rate your motivation level
  if (questionMap.has('question-3')) {
    const options: QuestionOption[] = [
      { id: '1', text: 'Very low' },
      { id: '2', text: 'Low' },
      { id: '3', text: 'Neutral' },
      { id: '4', text: 'High' },
      { id: '5', text: 'Very high' }
    ];

    reconstructedQuestions.push({
      id: 'question-3',
      type: 'likert5',
      text: 'How would you rate your current motivation level for exercising?',
      description: '',
      isRequired: true,
      options: options
    });
  }

  // Question 4: Goals text question
  if (questionMap.has('question-4')) {
    reconstructedQuestions.push({
      id: 'question-4',
      type: 'text',
      text: 'What are your main fitness goals?',
      description: 'Please describe your fitness objectives and what you hope to achieve.',
      isRequired: false,
      options: []
    });
  }

  // Update the survey in the database
  const { error: updateError } = await supabase
    .from('surveys')
    .update({
      questions: reconstructedQuestions,
      name: 'Fitness and Exercise Survey',
      description: 'A survey about fitness habits and exercise preferences'
    })
    .eq('id', surveyId);

  if (updateError) {
    throw new Error('Failed to update survey: ' + updateError.message);
  }

  return reconstructedQuestions;
}
