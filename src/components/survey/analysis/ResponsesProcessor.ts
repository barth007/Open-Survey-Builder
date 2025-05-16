
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
}

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

export function processResponses(survey: Survey, responses: SurveyResponse[] | undefined): ProcessedResponseGroup[] {
  if (!responses || responses.length === 0) {
    return [];
  }

  const result = survey.questions
    .filter(question => question.type === 'multipleChoice' || question.type === 'checkboxes' || 
                        question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10')
    .map(question => {
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
            // Handle single selection
            answerCounts[answer.value] = (answerCounts[answer.value] || 0) + 1;
          }
        }
      });

      // Convert to our response format and map option IDs to text
      const optionMap = new Map(
        question.options.map(option => [option.id, option.text])
      );

      const processedAnswers: ResponseData[] = Object.entries(answerCounts).map(([answerId, count]) => ({
        answer: optionMap.get(answerId) || answerId,
        count: count
      }));

      return {
        questionId: question.id,
        question: question.text,
        responses: processedAnswers,
        likert: question.type.startsWith('likert')
      };
    })
    .filter(item => item.responses.length > 0); // Only include questions with answers
  
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
