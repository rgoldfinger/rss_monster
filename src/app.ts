import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';

import * as saveController from './controllers/save';
import * as rankController from './controllers/rank';
import * as timeController from './controllers/time';
import * as resaveController from './controllers/resave';
import * as landingController from './controllers/landing';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
