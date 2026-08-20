const { execSync } = require('child_process');
const path = require('path');

const TEST_DATABASE_URL =
  'postgresql://stepup_user:stepup_password@localhost:5432/stepup_test?schema=public';

module.exports = async () => {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: path.join(__dirname, '.'),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
};
