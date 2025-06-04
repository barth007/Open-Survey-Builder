
import { reconstructSurveyQuestions } from './surveyReconstruction';

export async function executeReconstruction() {
  try {
    console.log('Starting survey reconstruction...');
    const surveyId = 'bbda424e-1a1c-401a-9530-fb1c735d1e9c';
    const questions = await reconstructSurveyQuestions(surveyId);
    console.log('Survey reconstruction completed successfully:', questions);
    return questions;
  } catch (error) {
    console.error('Survey reconstruction failed:', error);
    throw error;
  }
}

// Auto-execute the reconstruction
executeReconstruction();
