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

const getToken = async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const token = data.body["access_token"];
    const expired = data.body.expires_in
    console.log(`${token} expired in ${expired}`);
    spotifyApi.setAccessToken(token);
    return res.send({ status: 200, data: token });
  } catch (err) {
    console.log(err);
    return res.send({ status: 500, message: 'error', err });
  }
}

module.exports = {spotifyApi, getToken};
