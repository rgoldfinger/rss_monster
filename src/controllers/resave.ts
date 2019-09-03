import { Request, Response } from 'express';

import store, { TweetKind, LinkKind, Tweet, Link } from '../store';
import { saveLinkData } from './save';

export async function resaveLinks(req: Request, res: Response) {
  const query = store.createQuery(TweetKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Tweet[];

  await Promise.all(results.map(saveLinkData));
  res.sendStatus(200);
}
export async function resaveTweets(req: Request, res: Response) {
  const query = store.createQuery(TweetKind);

  console.log('fetching query');
  const entities = await store.runQuery(query);
  const results = entities[0] as Tweet[];
  const toUpdate = results.filter(t => !t.accountId).splice(0, 400);
  await store.save(
    toUpdate.map(l => ({
      data: {
        ...l,
        accountId: '385732706',
      },
      method: 'upsert',
      key: store.key([TweetKind, l.twitterId]),
      excludeFromIndexes: ['text', 'likes', 'rts', 'link', 'twDisplayLink'],
    })),
  );
  res.status(200).send(`Updated ${toUpdate.length}`);
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
