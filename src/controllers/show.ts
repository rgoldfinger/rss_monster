import { Request, Response } from 'express';
import { groupBy } from 'lodash';

import ShowView from '../views/ShowView';
import store from '../store';
import date from 'date-and-time';
import { TweetKind, Tweet, LinkKind, saveLinkData } from './save';
import { DateTime } from 'luxon';

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
  tweetIds?: number[];
};

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  const page = req.params.id ? parseInt(req.params.id, 10) : 0;
  const nowPacifc = DateTime.fromObject({ zone: 'America/Los_Angeles' });

  const today = new Date(nowPacifc.year, nowPacifc.month - 1, nowPacifc.day);
  const queryStartDate = date.addDays(today, page);
  const queryEndDate = date.addDays(queryStartDate, 1);
  try {
    const query = store
      .createQuery(LinkKind)
      .filter('postedAt', '>', queryStartDate)
      .filter('postedAt', '<', queryEndDate);
    // .order('score');

    const entities = await store.runQuery(query);
    const results = entities[0] as Link[];

    // const grouped = groupBy(results, t => t.linkHash);
    // const sorted: Link[] = Object.keys(grouped)
    //   .map(k => {
    //     const tweets = grouped[k];
    //     return tweets.reduce(
    //       // @ts-ignore
    //       (l, t) => {
    //         return {
    //           link: t.link,
    //           linkHash: t.linkHash,
    //           rts: t.rts + (l.rts || 0),
    //           likes: t.likes + (l.likes || 0),
    //           tweets: (l.tweets || 0) + 1,
    //           postedAt: new Date(t.postedAt),
    //           twDisplayLink: t.twDisplayLink,
    //         };
    //       },
    //       {} as Link,
    //     );
    //   })
    //   .map((l, i: number) => ({
    //     ...l,
    //     // Be sure to save the score when you're normalizing
    //     score: (l.tweets - 1) * 500 + l.likes + l.rts,
    //   }))
    //   .sort((a, b) => {
    //     if (a.score > b.score) return -1;
    //     if (a.score < b.score) return 1;
    //     return 0;
    //   });

    const sorted = results.sort((a, b) => {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      return 0;
    });

    res.send(ShowView(sorted, queryStartDate, page));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
