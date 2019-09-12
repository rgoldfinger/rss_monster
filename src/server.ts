import errorHandler from 'errorhandler';
import app from './app';
import greenlockExpress from 'greenlock-express';
import greenlockStore from 'greenlock-store-fs';

if (process.env.NODE_ENV === 'development' || process.env.PORT) {
  app.use(errorHandler());
  app.listen(app.get('port'), () => {
    console.log(
      '  App is running at http://localhost:%d in %s mode',
      app.get('port'),
      app.get('env'),
    );
    console.log('  Press CTRL-C to stop\n');
  });
} else {
  // https://github.com/Scharkee/react-redux-passport-uikit-express-boiler/blob/master/src/server/index.js
  var glx = greenlockExpress.create({
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    // Note: If at first you don't succeed, stop and switch to staging:
    // https://acme-staging-v02.api.letsencrypt.org/directory
    version: 'draft-11', // Let's Encrypt v2 (ACME v2)

    // If you wish to replace the default account and domain key storage plugin
    store: greenlockStore,

    // Contribute telemetry data to the project
    telemetry: false,

    // the default servername to use when the client doesn't specify
    // (because some IoT devices don't support servername indication)
    // servername: 'rss-monster.rgoldfinger.com',
    email: 'rgoldfinger@gmail.com',
    agreeTos: true, // Accept Let's Encrypt ToS
    app,
    approveDomains: ['rss-monster.rgoldfinger.com'],
  });

  const server = glx.listen(80, 443);

  server.on('listening', function() {
    console.info(server.type + ' listening on', server.address());
  });
}

/**
 * Error Handler. Provides full stack - remove for production
 */
