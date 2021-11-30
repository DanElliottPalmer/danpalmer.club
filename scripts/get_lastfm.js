#!/usr/bin/env node

const https = require("https");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_ACCOUNT = "universalgonads";

const URL_WEEKLY_ARTISTS = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${LASTFM_ACCOUNT}&api_key=${API_KEY}&format=json`;
const URL_WEEKLY_TRACKS = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${LASTFM_ACCOUNT}&api_key=${API_KEY}&format=json`;

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

function getUrlResponse(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      response.setEncoding("utf8");

      if (response.statusCode !== 200) {
        reject(new Error(`Bads statuscode: ${response.statusCode}`));
        return;
      }

      let body = "";
      response.on("data", (chunk) => (body += chunk));
      response.on("end", () => resolve(body));
    });

    request.on("error", reject);
    request.end();
  });
}

async function getTopArtists() {
  try {
    var weeklyArtists = await getUrlResponse(URL_WEEKLY_ARTISTS);
    weeklyArtists = JSON.parse(weeklyArtists);
  } catch (err) {
    console.error(`Error! ${err.message}`, err);
    process.exit(1);
  }

  return weeklyArtists.weeklyartistchart.artist.slice(0, 3).map((item) => {
    return {
      artist: item.name,
      count: parseInt(item.playcount, 10),
      url: item.url,
    };
  });
}

async function getTopTrack() {
  try {
    var topTrack = await getUrlResponse(URL_WEEKLY_TRACKS);
    topTrack = JSON.parse(topTrack);
  } catch (err) {
    console.error(`Error! ${err.message}`, err);
    process.exit(1);
  }

  topTrack = topTrack.weeklytrackchart.track[0];
  return {
    artist: topTrack.artist["#text"],
    count: parseInt(topTrack.playcount, 10),
    name: topTrack.name,
    url: topTrack.url,
  };
}

async function writeDataFile(jsonData) {
  try {
    await mkdir(path.resolve(__dirname, "../src/_data"), { recursive: true });
  } catch (err) {
    console.error(`Error! ${err.message}`, err);
    process.exit(1);
  }

  const fileContents = JSON.stringify(jsonData);
  const filename = path.resolve(__dirname, "../src/_data/lastfm.json");
  try {
    await writeFile(filename, fileContents);
  } catch (err) {
    console.error(`Error! ${err.message}`, err);
    process.exit(1);
  }
}

(async function () {
  const topArtists = await getTopArtists();
  const topTrack = await getTopTrack();
  await writeDataFile({ topArtists, topTrack });

  process.exit(0);
})();
