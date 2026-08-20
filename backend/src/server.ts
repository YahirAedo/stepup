import 'dotenv/config';
import './config/env';
import { createApp } from './app';

const port = Number(process.env.PORT) || 3000;

const app = createApp();

app.listen(port, () => {
  console.log(`StepUp backend listening on http://localhost:${port}`);
});
