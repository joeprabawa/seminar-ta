const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

(async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const token = data.body["access_token"];
    const expired = data.body.expires_in
    console.log(`${token} expired in ${expired}`);
    spotifyApi.setAccessToken(token);
  } catch (err) {
    console.log(err);
  }
})();

const getToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const token = data.body["access_token"];
    const expired = data.body.expires_in
    console.log(`${token} expired in ${expired}`);
    spotifyApi.setAccessToken(token);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {spotifyApi, getToken};
