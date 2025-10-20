import { initEs } from '../db/es';
import { seedVectors } from '../db/seed';

export async function start() {
  await initEs();
  await seedVectors();
}

if (require.main === module) {
  start().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
