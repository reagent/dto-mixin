import { initialize } from './initialize';

async function bootstrap() {
  const app = await initialize();
  await app.listen(3000);
}
bootstrap();
