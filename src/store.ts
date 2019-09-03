import { Datastore, DatastoreOptions } from '@google-cloud/datastore';
import fs from 'fs';

export const TweetKind = 'Tweet';
export const LinkKind = 'Link';
export const UserKind = 'Link';

export type Link = {
  link: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
  tweets: number | undefined;
  score: number;
  twDisplayLink?: string;
  pageTitle?: string;
  tweetIds?: string[];
};

export type Tweet = {
  twitterId: string;
  text: string;
  link: string;
  twDisplayLink?: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
  linkTitle?: string;
};

export type User = {
  twId: string;
  username: string;
  encryptedOAuthToken: string;
  encryptedOAuthTokenSecret: string;
};

const options = {} as DatastoreOptions;
const filePath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'datastore-service-account.json';
if (fs.existsSync(filePath)) {
  options.keyFilename = filePath;
  options.projectId = process.env.GCLOUD_PROJECT || 'rss-monster';
}

export default new Datastore(options);
