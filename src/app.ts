import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';

import passport from 'passport';
import { Strategy } from 'passport-twitter';
import expressSession from 'express-session';

import * as saveController from './controllers/save';
import * as rankController from './controllers/rank';
import * as timeController from './controllers/time';
import * as resaveController from './controllers/resave';
import * as landingController from './controllers/landing';

import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } from './util/secrets';

// Create Express server
const app = express();
app.use(
  expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }),
);

// https://github.com/passport/express-4.x-twitter-example/blob/master/server.js
passport.use(
  new Strategy(
    {
      consumerKey: TWITTER_API_KEY,
      consumerSecret: TWITTER_API_SECRET_KEY,
      callbackURL: '/oauth/twitter/callback',
    },
    function(token, tokenSecret, profile, cb) {
      console.log('hereere 1');
      console.log({ profile, token });
      // In this example, the user's Twitter profile is supplied as the user
      // record.  In a production-quality application, the Twitter profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    },
  ),
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  console.log('serializeUser');
  console.log({ user });
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  console.log('deserializeUser');
  console.log({ obj });
  cb(null, obj);
});

// Express configuration
app.set('port', process.env.PORT || 3000);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login/twitter', passport.authenticate('twitter'));

app.get(
  '/oauth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    // TODO redirect to user's home page directly
    res.redirect('/');
  },
);

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
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
app.get('/u/:username', landingController.show);

export default app;
