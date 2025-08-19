require('dotenv').config({ path: __dirname + '/../.env' }); // Load .env from parent folder

var express = require('express');
var request = require('request');
var querystring = require('querystring');

// Loading values
var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
var redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);

var app = express();

let access_token = null;
let refresh_token = null;

// LOGIN ROUTE
app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

// CALLBACK ROUTE
app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    return res.redirect('/#' +
      querystring.stringify({ error: 'state_mismatch' }));
  }

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      refresh_token = body.refresh_token;

      // Start automatic refresh in the background
      startAutoRefresh();

      return res.send('✅ Success! Access token obtained. Server will auto-refresh it.');
    } else {
      return res.redirect('/#' +
        querystring.stringify({ error: 'invalid_token' }));
    }
  });
});

// DEBUG ENDPOINT: manually refresh token
app.get('/refresh_token', async function(req, res) {
  try {
    const tokens = await refreshAccessToken();
    res.send(tokens);
  } catch (err) {
    res.status(500).send({ error: 'Failed to refresh manually', details: err });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://127.0.0.1:3000');
});

//________________________________________

// Refresh the token
async function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        refresh_token = body.refresh_token || refresh_token; // Spotify may return a new refresh token
        console.log('🔄 Access token refreshed');
        resolve({ access_token, refresh_token });
      } else {
        console.error('❌ Failed to refresh token', body);
        reject(error || body);
      }
    });
  });
}

// Auto-refresh every 50 minutes
function startAutoRefresh() {
  const interval = 50 * 60 * 1000; // 50 minutes in ms
  setInterval(() => {
    refreshAccessToken().catch(err => console.error('Auto-refresh failed:', err));
  }, interval);
}

// Utility function to generate a random state string
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
