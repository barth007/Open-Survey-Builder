import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import PrismaPkg from '@prisma/client';

import { createMockSurveyFixture } from './mock-survey-fixture.mjs';

const { PrismaClient } = PrismaPkg;

dotenv.config({
  path: new URL('../.env', import.meta.url),
});

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed mock survey data.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });
const fixture = createMockSurveyFixture();

const upsertUser = async (email, name, passwordHash) => prisma.user.upsert({
  where: { email },
  update: {
    name,
    passwordHash,
    status: 'approved',
    role: 'user',
  },
  create: {
    email,
    name,
    passwordHash,
    status: 'approved',
    role: 'user',
  },
});

try {
  const passwordHash = await bcrypt.hash(fixture.owner.password, 10);
  const owner = await upsertUser(fixture.owner.email, fixture.owner.name, passwordHash);

  const participantRecords = new Map();

  for (const participant of fixture.participants) {
    const participantUser = await upsertUser(participant.email, participant.name, passwordHash);
    participantRecords.set(participant.email, participantUser);
  }

  const survey = await prisma.survey.upsert({
    where: { publicCode: fixture.survey.publicCode },
    update: {
      name: fixture.survey.title,
      description: fixture.survey.description,
      questions: fixture.survey.questions,
      isPublished: fixture.survey.isPublished,
      userId: owner.id,
      folderId: null,
      teamId: null,
      welcomeTitle: fixture.survey.welcomeTitle,
      welcomeMessage: fixture.survey.welcomeMessage,
      welcomeInstructions: fixture.survey.welcomeInstructions,
      welcomeButtonText: fixture.survey.welcomeButtonText,
      thankYouTitle: fixture.survey.thankYouTitle,
      thankYouMessage: fixture.survey.thankYouMessage,
      thankYouButtonText: fixture.survey.thankYouButtonText,
      redirectUrl: null,
      recordingEnabled: fixture.survey.recordingEnabled,
      recordingRequired: fixture.survey.recordingRequired,
    },
    create: {
      name: fixture.survey.title,
      description: fixture.survey.description,
      questions: fixture.survey.questions,
      isPublished: fixture.survey.isPublished,
      publicCode: fixture.survey.publicCode,
      userId: owner.id,
      welcomeTitle: fixture.survey.welcomeTitle,
      welcomeMessage: fixture.survey.welcomeMessage,
      welcomeInstructions: fixture.survey.welcomeInstructions,
      welcomeButtonText: fixture.survey.welcomeButtonText,
      thankYouTitle: fixture.survey.thankYouTitle,
      thankYouMessage: fixture.survey.thankYouMessage,
      thankYouButtonText: fixture.survey.thankYouButtonText,
      redirectUrl: null,
      recordingEnabled: fixture.survey.recordingEnabled,
      recordingRequired: fixture.survey.recordingRequired,
    },
  });

  await prisma.surveyResponse.deleteMany({
    where: { surveyId: survey.id },
  });

  for (const response of fixture.responses) {
    const participant = participantRecords.get(response.participantEmail);

    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        participantId: participant?.id,
        participantEmail: response.participantEmail,
        answers: response.answers,
        metadata: response.metadata,
        submittedAt: new Date(response.submittedAt),
        status: 'submitted',
      },
    });
  }

  console.log(`Mock survey seeded successfully.
Owner login: ${fixture.owner.email} / ${fixture.owner.password}
Survey ID: ${survey.id}
Public link: /p/${fixture.survey.publicCode}
Responses created: ${fixture.responses.length}`);
} finally {
  await prisma.$disconnect();
}
