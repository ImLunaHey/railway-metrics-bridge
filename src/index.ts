import cron from 'node-cron';
import { config } from './config';
import { fetchMetrics } from './metrics';

// Run once on startup
await fetchMetrics();

if (config.cron) {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    await fetchMetrics();
  });
}
