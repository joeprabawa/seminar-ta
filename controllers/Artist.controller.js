require("dotenv").config();
const spotifyApi = require("../spotify");
const { google } = require("googleapis");

async function getID(query) {
  try {
    const ids = await google.youtube("v3").search.list({
      key: process.env.API_KEY,
      part: "snippet",
      type: "video",
      q: query,
      maxResults: 5,
      videoDuration: "long",
    });
    const results = ids.data.items.map((value) => value.id.videoId);
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getVideosStats(query) {
  const ids = await getID(query);
  try {
    const getVideo = await google.youtube("v3").videos.list({
      key: process.env.API_KEY,
      part: ["snippet", "statistics"],
      id: ids,
    });
    const results = getVideo.data.items.map((response) => {
      return {
        id: response.id,
        title: response.snippet.title,
        published: response.snippet.publishedAt,
        fromChannel: response.snippet.channelTitle,
        thumbnails: response.snippet.thumbnails,
        stats: { ...response.statistics },
      };
    });
    return results;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  searchArtist: async (req, res) => {
    const query = req.params.query;
    const search = await spotifyApi.searchArtists(query, { limit: 5 });
    const { items } = search.body.artists;
    const itemsIncTopTracks = await Promise.all(
      items.map(async (artist) => {
        const results = await spotifyApi.getArtistTopTracks(artist.id, "ID");
        const topTracks = results.body.tracks.map((track) => {
          const { images, release_date, name: album_name } = track.album;
          const { name, popularity } = track;
          return {
            images,
            release_date,
            name,
            popularity,
            album_name,
          };
        });
        return {
          ...artist,
          followers: artist.followers.total,
          top_tracks: topTracks,

          price: "",
          budget: "",
        };
      })
    );

    res.send({ status: 200, data: itemsIncTopTracks });
  },

  searchYoutubeStats: async (req, res) => {
    try {
      const ytQuery = `${req.params.query} live`;
      console.log(ytQuery);
      const result = await getVideosStats(ytQuery);
      console.log(result);
      return res.send({ status: 200, data: result });
    } catch (err) {
      console.log(err);
    }
  },

  findArtist: async (req, res) => {
    const artistID = req.params.id;
    const artistDetail = await spotifyApi.getArtist(artistID);
    let { body } = artistDetail;
    const artistTopTracks = await spotifyApi.getArtistTopTracks(artistID, "ID");
    const top_tracks = artistTopTracks.body.tracks.map((track) => {
      const { images, release_date, name: album_name } = track.album;
      const { name, popularity } = track;
      return {
        images,
        release_date,
        name,
        popularity,
        album_name,
      };
    });
    body = { ...body, top_tracks };
    res.send({ status: 200, data: body });
  },

  searchGenres: async (req, res) => {
    const search = await spotifyApi.getAvailableGenreSeeds();
    const results = search.body;
    res.send(results);
  },
};
