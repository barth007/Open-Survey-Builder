
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
  isOrphaned?: boolean; // Flag for responses to deleted/modified questions
}

export interface ResponseProcessingStats {
  totalResponses: number;
  matchedQuestions: number;
  orphanedResponses: number;
  questionsWithResponses: number;
  questionsWithoutResponses: number;
}

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

export function processResponses(survey: Survey, responses: SurveyResponse[] | undefined): ProcessedResponseGroup[] {
  console.log('Processing responses:', { surveyQuestionsCount: survey.questions.length, responsesCount: responses?.length || 0 });
  
  if (!responses || responses.length === 0) {
    console.log('No responses to process');
    return [];
  }

  // Create a map of current question IDs for quick lookup
  const currentQuestionMap = new Map(
    survey.questions.map(q => [q.id, q])
  );

  // Collect all unique question IDs from responses
  const responseQuestionIds = new Set<string>();
  responses.forEach(response => {
    response.answers.forEach(answer => {
      responseQuestionIds.add(answer.questionId);
    });
  });

  console.log('Current survey question IDs:', Array.from(currentQuestionMap.keys()));
  console.log('Question IDs in responses:', Array.from(responseQuestionIds));

  const result: ProcessedResponseGroup[] = [];

  // Process current questions with responses
  survey.questions.forEach(question => {
    console.log(`Processing current question ${question.id} of type ${question.type}`);
    
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

    // Only add to results if there are responses
    if (Object.keys(answerCounts).length > 0) {
      const processedAnswers = processAnswersForQuestion(question, answerCounts);
      
      result.push({
        questionId: question.id,
        question: question.text,
        responses: processedAnswers,
        likert: question.type.startsWith('likert'),
        questionType: question.type,
        isOrphaned: false
      });
    }
  });

  // Process orphaned responses (responses to questions no longer in survey)
  const orphanedQuestionIds = Array.from(responseQuestionIds).filter(
    qId => !currentQuestionMap.has(qId)
  );

  console.log('Orphaned question IDs:', orphanedQuestionIds);

  orphanedQuestionIds.forEach(questionId => {
    console.log(`Processing orphaned question ${questionId}`);
    
    let answerCounts: Record<string, number> = {};
    
    responses.forEach(response => {
      const answer = response.answers.find((a) => a.questionId === questionId);
      
      if (answer) {
        if (Array.isArray(answer.value)) {
          answer.value.forEach(val => {
            answerCounts[val] = (answerCounts[val] || 0) + 1;
          });
        } else {
          const value = String(answer.value);
          answerCounts[value] = (answerCounts[value] || 0) + 1;
        }
      }
    });

    if (Object.keys(answerCounts).length > 0) {
      const processedAnswers = Object.entries(answerCounts).map(([value, count]) => ({
        answer: value || '(Empty response)',
        count: count
      }));

      result.push({
        questionId: questionId,
        question: `[Archived Question] ID: ${questionId}`,
        responses: processedAnswers,
        likert: false,
        questionType: 'archived',
        isOrphaned: true
      });
    }
  });

  console.log('Final processed response groups:', result.length);
  return result;
}

function processAnswersForQuestion(question: Question, answerCounts: Record<string, number>): ResponseData[] {
  if (question.type === 'text') {
    // For text questions, show individual responses or aggregate if too many
    const textResponses = Object.entries(answerCounts);
    if (textResponses.length > 10) {
      // If too many unique text responses, show total count
      const totalResponses = Object.values(answerCounts).reduce((sum, count) => sum + count, 0);
      return [{
        answer: `${totalResponses} text responses`,
        count: totalResponses
      }];
    } else {
      // Show individual text responses
      return textResponses.map(([text, count]) => ({
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

    return Object.entries(answerCounts).map(([answerId, count]) => {
      // Try to map to option text, fallback to the raw value
      const answerText = optionMap.get(answerId) || answerId;
      return {
        answer: answerText,
        count: count
      };
    });
  } else {
    // For other question types, use raw values
    return Object.entries(answerCounts).map(([value, count]) => ({
      answer: value || '(Empty response)',
      count: count
    }));
  }
}

export function getResponseProcessingStats(survey: Survey, responses: SurveyResponse[] | undefined): ResponseProcessingStats {
  if (!responses || responses.length === 0) {
    return {
      totalResponses: 0,
      matchedQuestions: 0,
      orphanedResponses: 0,
      questionsWithResponses: 0,
      questionsWithoutResponses: survey.questions.length
    };
  }

  const currentQuestionIds = new Set(survey.questions.map(q => q.id));
  const responseQuestionIds = new Set<string>();
  
  responses.forEach(response => {
    response.answers.forEach(answer => {
      responseQuestionIds.add(answer.questionId);
    });
  });

  const matchedQuestionIds = Array.from(responseQuestionIds).filter(qId => currentQuestionIds.has(qId));
  const orphanedQuestionIds = Array.from(responseQuestionIds).filter(qId => !currentQuestionIds.has(qId));

  let orphanedResponseCount = 0;
  orphanedQuestionIds.forEach(questionId => {
    responses.forEach(response => {
      if (response.answers.some(a => a.questionId === questionId)) {
        orphanedResponseCount++;
      }
    });
  });

  return {
    totalResponses: responses.length,
    matchedQuestions: matchedQuestionIds.length,
    orphanedResponses: orphanedResponseCount,
    questionsWithResponses: matchedQuestionIds.length,
    questionsWithoutResponses: survey.questions.length - matchedQuestionIds.length
  };
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
