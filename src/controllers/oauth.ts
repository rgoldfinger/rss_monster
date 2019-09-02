import { Request, Response } from 'express';
import oauth from 'oauth';

import LandingView from '../views/LandingView';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } from '../util/secrets';

// https://gist.github.com/JuanJo4/e408d9349b403523aeb00f262900e768
const consumer = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  '1.0A',
  'http://localhost:3000/oauth/twitter/callback',
  'HMAC-SHA1',
);

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  // @ts-ignore
  console.log(req.session);
  // [Node] { 'oauth:twitter':
  // [Node]    { oauth_token: 'yOBkjgAAAAAA_LpKAAABbPJ6Xf0',
  // [Node]      oauth_token_secret: 'kTqOLdFevCm9MPaKidiIQlUhkygjVwoX' } }
  // @ts-ignore
  console.log(req.twSession);
  // [Node] { 'oauth:twitter':
  // [Node]    { oauth_token: 'yOBkjgAAAAAA_LpKAAABbPJ6Xf0',
  // [Node]      oauth_token_secret: 'kTqOLdFevCm9MPaKidiIQlUhkygjVwoX' } }

  console.log(req.user);
  // TODO if logged in, redirect to /u/:username
  res.send(LandingView({}));
};

// app.get('/u/:username', function(req, res) {
//   consumer.get(
//     'https://api.twitter.com/1.1/account/verify_credentials.json',
//     req.session.oauthAccessToken,
//     req.session.oauthAccessTokenSecret,
//     function(error: Error, data: string, response: any) {
//       if (error) {
//         //console.log(error)
//         res.redirect('/sessions/connect');
//       } else {
//         var parsedData = JSON.parse(data);
//         res.send('You are signed in: ' + parsedData.screen_name);
//       }
//     },
//   );
// });

export function twLogin(req: Request, res: Response) {
  consumer.getOAuthRequestToken(function(
    error,
    oauthToken,
    oauthTokenSecret,
    results,
  ) {
    if (error) {
      console.log(error);
      res.send('Error getting OAuth request token : ' + error);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      //   console.log('Double check on 2nd step');
      //   console.log('------------------------');
      //   console.log('<<' + req.session.oauthRequestToken);
      //   console.log('<<' + req.session.oauthRequestTokenSecret);
      res.redirect(
        'https://twitter.com/oauth/authorize?oauth_token=' +
          req.session.oauthRequestToken,
      );
    }
  });
}

export function twCallback(req: Request, res: Response) {
  //   console.log('------------------------');
  //   console.log('>>' + req.session.oauthRequestToken);
  //   console.log('>>' + req.session.oauthRequestTokenSecret);
  //   console.log('>>' + req.query.oauth_verifier);
  consumer.getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        res.send(
          'Error getting OAuth access token : ' + error + '[' + results + ']',
        );
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        req.session.userId = results.user_id;
        req.session.username = results.screen_name;
        console.log(results);
        res.redirect(`/u/${results.screen_name}`);
      }
    },
  );
}
