import { PrismaPg } from '@prisma/adapter-pg';
import PrismaPkg from '@prisma/client';
import { config } from './config.js';

const { PrismaClient } = PrismaPkg;

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma = new PrismaClient({ adapter });
