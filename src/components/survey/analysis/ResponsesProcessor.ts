
import { Survey, Question, SurveyResponse } from '@/types/survey';

export interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

export interface ProcessedResponseGroup {
  questionId: string;
  question: string;
  responses: ResponseData[];
  likert: boolean;
  questionType: string;
}

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

export function processResponses(survey: Survey, responses: SurveyResponse[] | undefined): ProcessedResponseGroup[] {
  console.log('Processing responses:', { surveyQuestionsCount: survey.questions.length, responsesCount: responses?.length || 0 });
  
  if (!responses || responses.length === 0) {
    console.log('No responses to process');
    return [];
  }

  const result = survey.questions
    .map(question => {
      console.log(`Processing question ${question.id} of type ${question.type}`);
      
      // Collect all answers for this question
      let answerCounts: Record<string, number> = {};
      
      // Count occurrences of each answer
      responses.forEach(response => {
        const answer = response.answers.find((a) => a.questionId === question.id);
        
        if (answer) {
          if (Array.isArray(answer.value)) {
            // Handle checkboxes (multiple selections)
            answer.value.forEach(val => {
              answerCounts[val] = (answerCounts[val] || 0) + 1;
            });
          } else {
            // Handle single selection or text answers
            const value = String(answer.value);
            answerCounts[value] = (answerCounts[value] || 0) + 1;
          }
        }
      });

      console.log(`Question ${question.id} answer counts:`, answerCounts);

      // Convert to our response format based on question type
      let processedAnswers: ResponseData[] = [];

      if (question.type === 'text') {
        // For text questions, show individual responses or aggregate if too many
        const textResponses = Object.entries(answerCounts);
        if (textResponses.length > 10) {
          // If too many unique text responses, show total count
          const totalResponses = Object.values(answerCounts).reduce((sum, count) => sum + count, 0);
          processedAnswers = [{
            answer: `${totalResponses} text responses`,
            count: totalResponses
          }];
        } else {
          // Show individual text responses
          processedAnswers = textResponses.map(([text, count]) => ({
            answer: text || '(Empty response)',
            count: count
          }));
        }
      } else if (question.type === 'multipleChoice' || question.type === 'checkboxes' || 
                 question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10') {
        // For choice-based questions, map option IDs to text
        const optionMap = new Map(
          question.options?.map(option => [option.id, option.text]) || []
        );

        processedAnswers = Object.entries(answerCounts).map(([answerId, count]) => {
          // Try to map to option text, fallback to the raw value
          const answerText = optionMap.get(answerId) || answerId;
          return {
            answer: answerText,
            count: count
          };
        });
      } else {
        // For other question types, use raw values
        processedAnswers = Object.entries(answerCounts).map(([value, count]) => ({
          answer: value || '(Empty response)',
          count: count
        }));
      }

      console.log(`Question ${question.id} processed answers:`, processedAnswers);

      return {
        questionId: question.id,
        question: question.text,
        responses: processedAnswers,
        likert: question.type.startsWith('likert'),
        questionType: question.type
      };
    })
    .filter(item => {
      const hasResponses = item.responses.length > 0;
      console.log(`Question ${item.questionId} has responses:`, hasResponses);
      return hasResponses;
    }); // Only include questions with answers
  
  console.log('Final processed response groups:', result.length);
  return result;
}

export function calculatePercentages(responses: ResponseData[]): ResponseData[] {
  const total = responses.reduce((sum, item) => sum + item.count, 0);
  return responses.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100)
  }));
}

export function sortResponses(responses: ResponseData[], sortBy: "default" | "count" | "alpha"): ResponseData[] {
  const processedResponses = calculatePercentages(responses);
  
  if (sortBy === "count") {
    return [...processedResponses].sort((a, b) => b.count - a.count);
  } else if (sortBy === "alpha") {
    return [...processedResponses].sort((a, b) => a.answer.localeCompare(b.answer));
  }
  
  return processedResponses;
}

export function filterResponseGroups(
  responseGroups: ProcessedResponseGroup[],
  filterText: string
): ProcessedResponseGroup[] {
  return responseGroups.filter(item => 
    item.question.toLowerCase().includes(filterText.toLowerCase())
  );
}
