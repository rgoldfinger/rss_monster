import { Request, Response } from 'express';
import { flattenDeep, uniqBy, groupBy } from 'lodash';
import crypto from 'crypto';

import ShowView from '../views/ShowView';
import store from '../store';

import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
} from '../util/secrets';

import Twit from 'twit';

type Tweet = {
  twitterId: number;
  text: string;
  link: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
};

const TweetKind = 'Tweet';

const T = new Twit({
  consumer_key: TWITTER_API_KEY,
  consumer_secret: TWITTER_API_SECRET_KEY,
  access_token: TWITTER_ACCESS_TOKEN,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

type TWTweet = {
  text: string;
  entities: { urls: Array<{ expanded_url: string }> };
  retweet_count: number;
  favorite_count: number;
  id: number;
  created_at: string;
};

export type Link = {
  link: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
  tweets: number | undefined;
  rank: number;
};

export const fetchAndSave = (req: Request, res: Response) => {
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline.html
  T.get('statuses/home_timeline', {
    trim_user: true,
    exclude_replies: true,
    count: 200,
  })
    .then(async tResponse => {
      const data = tResponse.data as Array<TWTweet>;
      const allExpandedUrls = flattenDeep(
        data.map(t =>
          t.entities.urls.map(
            (u): Tweet => ({
              link: u.expanded_url,
              twitterId: t.id,
              text: t.text,
              likes: t.favorite_count,
              rts: t.retweet_count,
              postedAt: new Date(t.created_at),
              linkHash: crypto
                .createHash('md5')
                .update(u.expanded_url)
                .digest('hex'),
            }),
          ),
        ),
      );

      const uniqUrls = uniqBy(allExpandedUrls, u => u.twitterId);

      const filteredLinks = uniqUrls.filter(
        u =>
          !u.link.startsWith('https://twitter.com') &&
          !u.link.includes('tumblr.com'),
      );

      console.log(filteredLinks);

      try {
        const entities = await store.save(
          filteredLinks.map(l => ({
            data: l,
            method: 'upsert',
            key: store.key([TweetKind, l.twitterId]),
            excludeFromIndexes: ['text', 'likes', 'rts', 'link'],
          })),
        );
        res.send(entities);
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      }
    })
    .catch(err => {
      console.log('tw error', err);
      res.status(400).send(err);
    });
};
export const show = async (req: Request, res: Response) => {
  try {
    const entities = await store
      .createQuery(TweetKind)
      .order('postedAt')
      .run();
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
              postedAt: t.postedAt,
            };
          },
          {} as Link,
        );
      })
      .sort((a, b) => {
        if (a.tweets > b.tweets) return -1;
        if (a.tweets < b.tweets) return 1;
        if (a.rts > b.rts) return -1;
        if (a.rts < b.rts) return 1;
        if (a.likes > b.likes) return -1;
        if (a.likes < b.likes) return 1;
        return 0;
      })
      .map((l, i: number) => ({
        ...l,
        rank: i + 1,
      }));

    res.send(ShowView(sorted));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
