import { Request, Response } from 'express';
import { groupBy } from 'lodash';

import ShowView from '../views/ShowView';
import store from '../store';
import date from 'date-and-time';
import { TweetKind } from './save';

type Tweet = {
  twitterId: number;
  text: string;
  link: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
};

export type Link = {
  link: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
  tweets: number | undefined;
  rank: number;
  score: number;
};

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  const page = req.params.id ? parseInt(req.params.id, 10) : 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const queryStartDate = date.addDays(today, page);
  const queryEndDate = date.addDays(queryStartDate, 1);
  console.log({ today, queryEndDate, queryStartDate });
  try {
    const query = store
      .createQuery(TweetKind)
      .filter('postedAt', '>', queryStartDate)
      .filter('postedAt', '<', queryEndDate)
      .order('postedAt');

    const entities = await store.runQuery(query);
    const results = entities[0] as Tweet[];

    const grouped = groupBy(results, t => t.linkHash);
    const sorted: Link[] = Object.keys(grouped)
      .map(k => {
        const tweets = grouped[k];
        return tweets.reduce(
          (l, t) => {
            return {
              link: t.link,
              linkHash: t.linkHash,
              rts: t.rts + (l.rts || 0),
              likes: t.likes + (l.likes || 0),
              tweets: (l.tweets || 0) + 1,
              postedAt: new Date(t.postedAt),
            };
          },
          {} as Link,
        );
      })
      .map((l, i: number) => ({
        ...l,
        // Be sure to save the score when you're normalizing
        score: (l.tweets - 1) * 500 + l.likes + l.rts,
      }))
      .sort((a, b) => {
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        return 0;
      })
      .map((l, i: number) => ({
        ...l,
        rank: i + 1,
      }));

    res.send(ShowView(sorted, queryStartDate, page));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
