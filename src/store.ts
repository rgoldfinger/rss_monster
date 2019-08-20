import { Datastore, DatastoreOptions } from '@google-cloud/datastore';
import fs from 'fs';

const options = {} as DatastoreOptions;
const filePath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'datastore-service-account.json';
if (fs.existsSync(filePath)) {
  options.keyFilename = filePath;
  options.projectId = process.env.GCLOUD_PROJECT || 'rss-monster';
}

export default new Datastore(options);
