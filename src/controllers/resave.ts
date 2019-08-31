import { Request, Response } from 'express';

import store from '../store';
import { saveLinkData, Tweet, TweetKind, LinkKind } from './save';
import { Link } from './time';

export default async (req: Request, res: Response) => {
  const query = store.createQuery(TweetKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Tweet[];

  await Promise.all(results.map(saveLinkData));
  res.status(200);
};
export async function deleteLinks(req: Request, res: Response): Promise<void> {
  const query = store.createQuery(LinkKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Link[];

  await store.delete(results.map(r => store.key([LinkKind, r.linkHash])));
  res.status(200);
}
