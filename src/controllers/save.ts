import { Request, Response } from 'express';
import { flattenDeep, uniqBy } from 'lodash';
import crypto from 'crypto';

import store, {
  TweetKind,
  LinkKind,
  Tweet,
  UserKind,
  User,
  Link,
} from '../store';
import getPageTitle from '../util/pageTitle';

import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
} from '../util/secrets';

import Twit from 'twit';
import { decrypt } from '../util/encryption';
import { userInfo } from 'os';

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
    accountId: tweet.accountId,
  };
  try {
    const res = await store.get(linkKey);
    existingLink = res[0] || existingLink;
  } catch (e) {
    console.log('Error fetching ', linkKey);
    console.log(e);
  }

  let pageTitle = existingLink.pageTitle;
  if (!pageTitle) {
    console.log('fetching page title for ', tweet.twDisplayLink);
    pageTitle = await getPageTitle(tweet.link);
    if (!pageTitle) {
      console.log('But no page title found for ', tweet.link);
    } else {
      console.log('Page title found for ', tweet.link, pageTitle);
    }
  }
  const isSameTweet = existingLink.tweetIds.includes(tweet.twitterId);
  const isOnlyTweet = isSameTweet && existingLink.tweetIds.length === 1;

  const likes =
    existingLink.likes && !isOnlyTweet
      ? existingLink.likes + tweet.likes
      : tweet.likes;
  const rts =
    existingLink.rts && !isOnlyTweet ? existingLink.rts + tweet.rts : tweet.rts;
  const tweetIds = !isSameTweet
    ? [...existingLink.tweetIds, tweet.twitterId]
    : [tweet.twitterId];
  const tweets = tweetIds.length;

  const link: Link = {
    accountId: tweet.accountId,
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
    console.log('saving ', link.link, link.pageTitle, link.accountId);
    await store.save({
      data: link,
      method: 'upsert',
      key: linkKey,
      excludeFromIndexes: [
        'likes',
        'rts',
        'link',
        'twDisplayLink',
        'pageTitle',
      ],
    });
  } catch (e) {
    console.log('Error saving ', linkKey);
    console.log(e);
  }
};

export const fetchAndSave = (req: Request, res: Response) => {
  const T = new Twit({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET_KEY,
    access_token: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true, // optional - requires SSL certificates to be valid.
  });
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
              accountId: 'fake',
              link: u.expanded_url,
              twitterId: t.id.toString(),
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

export async function fetchTimelineAndSave(user: User) {
  console.log(`fetching timeline for: ${user.username}`);
  const T = new Twit({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET_KEY,
    access_token: decrypt(user.encryptedOAuthToken),
    access_token_secret: decrypt(user.encryptedOAuthTokenSecret),
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true, // optional - requires SSL certificates to be valid.
  });
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline.html

  T.get('statuses/home_timeline', {
    trim_user: true,
    exclude_replies: true,
    count: 200,
  }).then(async tResponse => {
    const data = tResponse.data as Array<TWTweet>;
    const allExpandedUrls = flattenDeep(
      data.map(t =>
        t.entities.urls.map(
          (u): Tweet => ({
            accountId: user.twId,
            link: u.expanded_url,
            twitterId: t.id.toString(),
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
      await store.save(
        filteredTweets.map(l => ({
          data: l,
          method: 'upsert',
          key: store.key([TweetKind, l.twitterId]),
          excludeFromIndexes: ['text', 'likes', 'rts', 'link', 'twDisplayLink'],
        })),
      );
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
    Promise.all(filteredTweets.map(saveLinkData));
  });
}

export const fetchUsersAndSave = async (req: Request, res: Response) => {
  // TODO logic to ensure that we're fetching all of the users. Or just move it to some sort of queue.
  const query = store.createQuery(UserKind);
  const results = await store.runQuery(query);
  const users = results[0] as User[];
  // Intentionally not waiting for these to finish.
  users.forEach(async user => {
    console.log('fetching user');
    console.log(user);
    await fetchTimelineAndSave(user);
  });
  res.sendStatus(200);
};
