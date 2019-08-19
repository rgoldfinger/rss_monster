import { Request, Response } from 'express';
import { flattenDeep, uniqBy } from 'lodash';
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
  postedAt: string;
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
          t.entities.urls.map(u => ({
            link: u.expanded_url,
            twitterId: t.id,
            text: t.text,
            likes: t.favorite_count,
            rts: t.retweet_count,
            postedAt: t.created_at,
          })),
        ),
      );

      const uniqUrls = uniqBy(allExpandedUrls, u => u.twitterId);

      const filteredLinks = uniqUrls.filter(
        u =>
          !u.link.startsWith('https://twitter.com') &&
          !u.link.includes('tumblr.com'),
      );

      try {
        const entities = await store.save(
          filteredLinks.map(l => ({
            data: l,
            method: 'upsert',
            key: store.key([TweetKind, l.twitterId]),
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
    const q = await store.createQuery(TweetKind);
    const entities = await store.runQuery(q);
    res.send(entities);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
