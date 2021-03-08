const express = require("express");
const router = express.Router();
const {getToken} = require('../spotify')
const {
  searchArtist,
  findArtist,
  searchGenres,
  searchYoutubeStats,
} = require("../controllers/Artist.controller");

router.get("/search/:query", searchArtist);
router.get("/search/yt/:query", searchYoutubeStats);
router.get("/genres", searchGenres);
router.get("/artist/:id", findArtist);
router.get("/token", getToken);

module.exports = router;
