#!/usr/bin/env node

// Fetches last week's top 3 artists and top track from ListenBrainz and writes
// them to src/_data/music.json for the site footer.
//
// Uses the stats endpoints (range=week: the previous full week, Monday to
// Monday UTC). Those are computed in batches and return 204 when there are no
// stats yet, so we fall back to counting the same week's listens ourselves.
//
// This script must never fail the build: on any error or missing data it
// removes the data file, and the footer hides itself.

const fs = require("fs/promises");
const path = require("path");

const USERNAME = "notreallydan";
const API = "https://api.listenbrainz.org/1";
const DATA_FILE = path.resolve(__dirname, "../src/_data/music.json");
const TIMEOUT_MS = 15000;
const ARTIST_COUNT = 3;
const LISTENS_PAGE_SIZE = 1000;
const MAX_LISTENS_PAGES = 20;

const artistUrl = (mbid) =>
  mbid ? `https://listenbrainz.org/artist/${mbid}/` : null;
const trackUrl = (mbid) =>
  mbid ? `https://listenbrainz.org/track/${mbid}/` : null;

// Returns parsed JSON, or null for 204 No Content.
async function getJson(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 204) return null;
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  }
  return response.json();
}

async function getFromStats() {
  const base = `${API}/stats/user/${USERNAME}`;
  const [artists, recordings] = await Promise.all([
    getJson(`${base}/artists?range=week&count=${ARTIST_COUNT}`),
    getJson(`${base}/recordings?range=week&count=1`),
  ]);

  const artistList = artists?.payload?.artists ?? [];
  const recording = recordings?.payload?.recordings?.[0];
  if (artistList.length === 0 || !recording) return null;

  return {
    topArtists: artistList.map((item) => ({
      artist: item.artist_name,
      count: item.listen_count,
      url: artistUrl(item.artist_mbid),
    })),
    topTrack: {
      artist: recording.artist_name,
      count: recording.listen_count,
      name: recording.track_name,
      url: trackUrl(recording.recording_mbid),
    },
  };
}

// The previous full week, Monday 00:00 UTC to Monday 00:00 UTC, as unix seconds.
function previousWeek(now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const thisMonday = today - daysSinceMonday * 86400000;
  const lastMonday = thisMonday - 7 * 86400000;
  return { from: lastMonday / 1000, to: thisMonday / 1000 };
}

async function getListens(from, to) {
  const listens = [];
  let maxTs = to;
  for (let page = 0; page < MAX_LISTENS_PAGES; page++) {
    const url = `${API}/user/${USERNAME}/listens?min_ts=${from}&max_ts=${maxTs}&count=${LISTENS_PAGE_SIZE}`;
    const batch = (await getJson(url))?.payload?.listens ?? [];
    listens.push(...batch);
    if (batch.length < LISTENS_PAGE_SIZE) break;
    maxTs = Math.min(...batch.map((listen) => listen.listened_at));
  }
  return listens;
}

function tally(map, key, init) {
  const entry = map.get(key) ?? { ...init, count: 0 };
  entry.count++;
  map.set(key, entry);
}

const byCount = (map) => [...map.values()].sort((a, b) => b.count - a.count);

async function getFromListens() {
  const { from, to } = previousWeek();
  const listens = await getListens(from, to);

  const artists = new Map();
  const tracks = new Map();
  for (const { track_metadata: meta } of listens) {
    if (!meta?.artist_name || !meta?.track_name) continue;
    const mapping = meta.mbid_mapping ?? {};
    // Only link an artist when the credit is a single MusicBrainz artist.
    const artistMbid =
      mapping.artists?.length === 1 ? mapping.artists[0].artist_mbid : null;

    tally(artists, meta.artist_name.toLowerCase(), {
      artist: meta.artist_name,
      url: artistUrl(artistMbid),
    });
    tally(
      tracks,
      mapping.recording_mbid ??
        `${meta.artist_name}\u0000${meta.track_name}`.toLowerCase(),
      {
        artist: meta.artist_name,
        name: meta.track_name,
        url: trackUrl(mapping.recording_mbid),
      },
    );
  }

  const topArtists = byCount(artists).slice(0, ARTIST_COUNT);
  const [topTrack] = byCount(tracks);
  if (topArtists.length === 0 || !topTrack) return null;
  return { topArtists, topTrack };
}

async function getMusic() {
  const stats = await getFromStats();
  if (stats) {
    console.log("music: using ListenBrainz weekly stats");
    return stats;
  }
  console.log("music: no weekly stats yet, counting last week's listens");
  return getFromListens();
}

(async function () {
  let music = null;
  try {
    music = await getMusic();
  } catch (err) {
    console.warn(`music: couldn't fetch from ListenBrainz: ${err.message}`);
  }

  if (music) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(music));
    console.log(`music: wrote ${path.relative(process.cwd(), DATA_FILE)}`);
  } else {
    await fs.rm(DATA_FILE, { force: true });
    console.warn("music: no data, footer will be hidden");
  }
})().catch((err) => {
  // Even a file system error shouldn't take down the nightly deploy.
  console.warn(`music: ${err.message}`);
});
