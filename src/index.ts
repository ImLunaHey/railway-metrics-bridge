import cron from 'node-cron';
import { config } from './config';
import { fetchMetrics } from './metrics';

// Run once on startup
await fetchMetrics();

if (config.cron) {
  // Run every 5 mins
  const cronTime = '*/1 * * * *';
  cron.schedule(cronTime, async () => {
    await fetchMetrics();
  });
}
