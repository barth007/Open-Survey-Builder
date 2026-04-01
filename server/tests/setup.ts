process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
process.env.JWT_SECRET ??= 'test-secret';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.UPLOADS_DIR ??= '/tmp/survey-builder-test-uploads';
