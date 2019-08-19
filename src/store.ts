import { Datastore } from '@google-cloud/datastore';

export default new Datastore({
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    'datastore-service-account.json',
  projectId: process.env.GCLOUD_PROJECT || 'rss-monster',
});
