import { app, initializeAppServices } from './app';
import { config } from './config/env';
async function startServer() {
  try {
    await initializeAppServices();
  } catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize application services. Exiting.', error);
    process.exit(1); 
  }
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
}

startServer();