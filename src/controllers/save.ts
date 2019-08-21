import { Request, Response } from 'express';
import { flattenDeep, uniqBy } from 'lodash';
import crypto from 'crypto';
import fetch from 'node-fetch';

import store from '../store';
import getPageTitle from '../util/pageTitle';

import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
} from '../util/secrets';

import Twit from 'twit';
import { Link } from './show';

export type Tweet = {
  twitterId: number;
  text: string;
  link: string;
  twDisplayLink?: string;
  likes: number;
  rts: number;
  postedAt: Date;
  linkHash: string;
  linkTitle?: string;
};

export const TweetKind = 'Tweet';
export const LinkKind = 'Link';

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
  entities: { urls: Array<{ expanded_url: string; display_url: string }> };
  retweet_count: number;
  favorite_count: number;
  id: number;
  created_at: string;
};

export const saveLinkData = async (tweet: Tweet) => {
  const linkKey = store.key([LinkKind, tweet.linkHash]);
  let existingLink: Partial<Link> = {
    rts: 0,
    likes: 0,
    tweetIds: [],
  };
  try {
    const res = await store.get(linkKey);
    existingLink = res[0] || existingLink;
  } catch (e) {
    console.log('Error fetching ', linkKey);
    console.log(e);
  }

  if (existingLink.tweetIds.includes(tweet.twitterId)) {
    return;
  }

  let pageTitle: undefined | string;
  if (!existingLink.pageTitle) {
    pageTitle = await getPageTitle(tweet.link);
  }

  const likes = existingLink.likes
    ? existingLink.likes + tweet.likes
    : tweet.likes;
  const rts = existingLink.rts ? existingLink.rts + tweet.rts : tweet.rts;
  const tweetIds = existingLink.tweetIds
    ? [...existingLink.tweetIds, tweet.twitterId]
    : [tweet.twitterId];
  const tweets = tweetIds.length;

  const link: Link = {
    likes,
    link: tweet.link,
    linkHash: tweet.linkHash,
    postedAt: new Date(tweet.postedAt),
    rts,
    score: (tweets - 1) * 500 + likes + rts,
    pageTitle,
    twDisplayLink: tweet.twDisplayLink,
    tweets,
    tweetIds,
  };
  try {
    await store.save({
      data: link,
      method: 'upsert',
      key: linkKey,
      excludeFromIndexes: ['tweets', 'likes', 'rts', 'link', 'twDisplayLink'],
    });
  } catch (e) {
    console.log('Error saving ', linkKey);
    console.log(e);
  }
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
              twDisplayLink: u.display_url,
              linkHash: crypto
                .createHash('md5')
                .update(u.expanded_url)
                .digest('hex'),
            }),
          ),
        ),
      );

      const uniqUrls = uniqBy(allExpandedUrls, u => u.twitterId);

      const filteredTweets = uniqUrls.filter(
        u =>
          !u.link.startsWith('https://twitter.com') &&
          !u.link.includes('tumblr.com'),
      );

      try {
        const entities = await store.save(
          filteredTweets.map(l => ({
            data: l,
            method: 'upsert',
            key: store.key([TweetKind, l.twitterId]),
            excludeFromIndexes: [
              'text',
              'likes',
              'rts',
              'link',
              'twDisplayLink',
            ],
          })),
        );
        res.send(entities);
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      }
      Promise.all(filteredTweets.map(saveLinkData));
    })
    .catch(err => {
      console.log('tw error', err);
      res.status(400).send(err);
    });
};
