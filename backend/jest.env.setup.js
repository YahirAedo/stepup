process.env.DATABASE_URL =
  'postgresql://stepup_user:stepup_password@localhost:5432/stepup_test?schema=public';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-stepup';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.GEMINI_RETRY_BASE_DELAY_MS = '1';
