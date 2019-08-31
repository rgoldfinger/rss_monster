import { Request, Response } from 'express';

import store from '../store';
import { saveLinkData, Tweet, TweetKind } from './save';

export default async (req: Request, res: Response) => {
  const query = store.createQuery(TweetKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Tweet[];

  await Promise.all(results.map(saveLinkData));
  res.status(200);
};
