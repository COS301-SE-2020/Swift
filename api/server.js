const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const app = express();
const DEFAULT_PORT = 3264;
const SERVER_PORT = process.env.PORT || DEFAULT_PORT;

// Parse JSON bodies
app.use(bodyParser.json({ limit: '8192kb' })); // 8192 kb (8mb) max header size

// Enable CORS
app.use(cors());

// Access user request info from GAE load balancer
app.set('trust proxy', true);

// Set Lumiqon server header
app.use((req, res, next) => {
  // res.setHeader('Server', 'Lumiqon');
  res.setHeader('X-Powered-By', 'Lumiqon');
  next();
});

// Handle malformed JSON requests
app.use((err, req, res, next) => {
  // check if this is a JSON parsing issue
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`Malformed JSON Middleware - ${err.type}:`, err.body);
    return res.status(400).send({ status: 400, reason: 'Bad Request' });
  }
  return next();
});

// Block ALL non-secure requests in production
if (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV.trim() === 'production') {
  app.use((req, res, next) => {
    // No need to log, just reject
    if (req.protocol !== 'https') {
      return res.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Set HSTS header
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return next();
  });
}

// API handle requests
app.delete('/', require('./api/api'));
app.get('/', require('./api/api'));
app.post('/', require('./api/api'));
app.put('/', require('./api/api'));

// Assets
app.use('/public', express.static(`${__dirname}/api/public`));

// health check endpoint
app.get('/status', require('./api/api'));

// Facebook OAUTH2
app.get('/auth/facebook', require('./api/api'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.post('/auth/facebook', bodyParser.urlencoded({ extended: true }), require('./api/api'));

// Google OAUTH2
app.get('/auth/google', require('./api/api'));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => { res.status(204).end(); });

// Start server
const server = app.listen(SERVER_PORT, () => {
  if (!process.env.PORT) {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port: ${server.address().port}`);
    // eslint-disable-next-line no-console
    console.log('Press Ctrl+C to quit.');
  }
});

// return object for unit testing
module.exports = server;
