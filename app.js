var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var dotenv        = require('dotenv');
var SpotifyWebApi = require('spotify-web-api-node');

dotenv.load();

var spotifyApi = new SpotifyWebApi({
  clientId     : process.env.SPOTIFY_KEY,
  clientSecret : process.env.SPOTIFY_SECRET,
  redirectUri  : process.env.SPOTIFY_REDIRECT_URI
});

var app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  if (spotifyApi.getAccessToken()) {
    return res.send('You are logged in.');
  }
  return res.send('<a href="/authorize">Authorize</a>');
});

app.get('/authorize', function(req, res) {
  var scopes = ['playlist-modify-public', 'playlist-modify-private'];
  var state  = new Date().getTime();
  var authoriseURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authoriseURL);
});

app.get('/callback', function(req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code)
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return res.redirect('/');
    }, function(err) {
      return res.send(err);
    });
});

//this code snippet allows you to check the token in your request body
//and not allow people outside of your group to use it.

// app.use('/store', function(req, res, next) {
//   if (req.body.token !== process.env.SLACK_TOKEN) {
//     return res.status(500).send('Cross site request forgerizzle!');
//   }
//   next();
// });

app.post('/store', function(req, res) {
  spotifyApi.refreshAccessToken()
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      if (data.body['refresh_token']) { 
        spotifyApi.setRefreshToken(data.body['refresh_token']);
      }

      spotifyApi.getPlaylistTracks(process.env.SPOTIFY_PLAYLIST_OWNER_ID, process.env.SPOTIFY_PLAYLIST_ID, { limit: 100 })
        .then(function(data) {
          //data contains the return from Spotify
          //here we pick the random song and return its URI

          var payload = data.body;
          var totalTracksInPlaylist = payload.total;
          var randomSongPosition = Math.floor(Math.random() * totalTracksInPlaylist);

          var songURL = payload.items[randomSongPosition].track.external_urls.spotify;

          return res.send({
            "response_type": "in_channel",
            "text": songURL,
            "unfurl_links": true,
            "unfurl_media": true 
          });

        }, function(err) {
          return res.send("ATTENTION: " + err.message);
        });
    }, function(err) {
      return res.send({
        "text": "Could not refresh access token. You probably need to re-authorize yourself from your app\'s homepage.",
        "attachments": [
          {
            "text": "https://angst-bot.herokuapp.com/authorize"
          }
        ]
      });
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));