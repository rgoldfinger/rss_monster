import { Request, Response } from 'express';

import store from '../store';
import { saveLinkData, Tweet, TweetKind, LinkKind } from './save';
import { Link } from './time';

export async function resaveLinks(req: Request, res: Response) {
  const query = store.createQuery(TweetKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Tweet[];

  await Promise.all(results.map(saveLinkData));
  res.status(200);
}
export async function deleteLinks(req: Request, res: Response): Promise<void> {
  const query = store.createQuery(LinkKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Link[];
  const toDel = results
    .map(r => store.key([LinkKind, r.linkHash]))
    .splice(0, 400);
  await store.delete(toDel);
  res.status(200).send(`Deleted ${toDel.length}`);
}
