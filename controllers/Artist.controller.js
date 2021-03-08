require("dotenv").config();
const {spotifyApi} = require("../spotify");
const { google } = require("googleapis");
const { parse } = require("iso8601-duration");

async function getYoutubeArtistID(query) {
  const getLastYear = new Date().getFullYear() - 1;
  const parsedLastYear = new Date(`${getLastYear}`).toISOString();

  try {
    const ids = await google.youtube("v3").search.list({
      key: process.env.API_KEY,
      part: "snippet",
      type: "video",
      q: query,
      maxResults: 5,
      order: "relevance",
      publishedAfter: parsedLastYear,
    });
    const results = ids.data.items.map((value) => value.id.videoId);
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getVideosStats(query) {
  const ids = await getYoutubeArtistID(query);
  try {
    const getVideo = await google.youtube("v3").videos.list({
      key: process.env.API_KEY,
      part: ["snippet", "contentDetails", "statistics"],
      id: ids,
    });
    const results = getVideo.data.items.map((response) => {
      return {
        id: response.id,
        title: response.snippet.title,
        published: response.snippet.publishedAt,
        duration: parse(response.contentDetails.duration),
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
    try {
      const query = req.params.query;
      const search = await spotifyApi.searchArtists(query);
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
            price: null,
            emailManager: null,
            contactPersonManager: null
          };
        })
      );
      res.send({ status: 200, data: itemsIncTopTracks });
    } catch (error) {
      res.send({ status: 500, message: 'error', error });
      next(error)
    }
  },

  searchYoutubeStats: async (req, res) => {
    try {
      const ytQuery = `${req.params.query} live concert`;
      const result = await getVideosStats(ytQuery);
      return res.send({ status: 200, data: result });
    } catch (error) {
      console.log(error);
      return res.send({ status: 500, message: 'error', error });
    }
  },

  findArtist: async (req, res) => {
    const artistID = req.params.id;
    console.log(artistID)
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
