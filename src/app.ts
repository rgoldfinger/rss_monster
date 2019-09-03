import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';

import clientSessions from 'client-sessions';

import * as saveController from './controllers/save';
import * as rankController from './controllers/rank';
import * as timeController from './controllers/time';
import * as resaveController from './controllers/resave';
import * as landingController from './controllers/landing';
import * as oauthController from './controllers/oauth';
import { COOKIE_SECRET } from './util/secrets';
import store, { UserKind, User } from './store';
import { decrypt } from './util/encryption';

declare global {
  namespace Express {
    interface Request {
      session?: any;
    }
  }
}

// Create Express server
const app = express();
app.use(
  // For whatever reason passport-twitter creates a session with our oauth credentials
  clientSessions({
    cookieName: 'session',
    secret: COOKIE_SECRET,
    duration: 90 * 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  }),
);

// Express configuration
app.set('port', process.env.PORT || 3000);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login/twitter', oauthController.twLogin);

app.get('/oauth/twitter/callback', oauthController.twCallback);

app.get('/logout', function(req, res) {
  req.session.reset(function(e: any) {
    res.redirect('/');
  });
});

/**
 * Primary app routes.
 */
app.get('/fetchAndSave', saveController.fetchAndSave);
app.get('/', timeController.show);
app.get('/page/:id', rankController.show);
app.get('/resave', resaveController.resaveLinks);
app.get('/delete', resaveController.deleteLinks);
app.get('/time/:id?', timeController.show);
app.get('/landing', landingController.show);
app.get('/u/:username', async function(req, res) {
  const userKey = store.key([UserKind, req.session.username]);
  const result = await store.get(userKey);
  const user = result[0] as User;
  // TODO if logged in, redirect to /u/:username
  res.send(user);
});
app.get('*', function(req, res) {
  res.redirect('/');
});

export default app;
