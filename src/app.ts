import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';

import * as saveController from './controllers/save';
import * as showController from './controllers/show';
import resave from './controllers/resave';

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
app.get('/', showController.show);
app.get('/page/:id', showController.show);
app.get('/resave', resave);

export default app;
