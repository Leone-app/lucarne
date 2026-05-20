const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.m4v', '.webm'];

// --- Config ---
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return { loopFolder: '', featureFile: '', featureTime: '', status: 'idle' };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

let config = loadConfig();
let scheduleTimer = null;
let folderWatcher = null;

// --- WebSocket broadcast ---
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  // Send current state immediately on connect
  ws.send(JSON.stringify({ type: 'state', config }));
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(data);
  });
}

// --- Video file listing ---
function getVideosInFolder(folderPath) {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath)
      .filter(f => VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .sort()
      .map(f => ({ name: f, path: path.join(folderPath, f) }));
  } catch (e) {
    return [];
  }
}

// --- Watch folder for changes ---
function watchFolder(folderPath) {
  if (folderWatcher) folderWatcher.close();
  if (!folderPath || !fs.existsSync(folderPath)) return;

  folderWatcher = chokidar.watch(folderPath, { depth: 0, ignoreInitial: true });
  folderWatcher.on('add', notifyFolderChange);
  folderWatcher.on('unlink', notifyFolderChange);
}

function notifyFolderChange() {
  const videos = getVideosInFolder(config.loopFolder);
  broadcast({ type: 'folder_update', videos });
}

// --- Scheduler ---
function scheduleFeature(timeStr) {
  if (scheduleTimer) clearTimeout(scheduleTimer);
  if (!timeStr) return;

  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target - now;
  const inMinutes = Math.round(delay / 60000);
  console.log(`[Scheduler] Feature scheduled in ${inMinutes} min (${timeStr})`);

  scheduleTimer = setTimeout(() => {
    console.log('[Scheduler] Launching feature film');
    config.status = 'feature';
    saveConfig(config);
    broadcast({ type: 'play_feature', file: config.featureFile });
    // After feature would end, we don't know duration — player will signal us
  }, delay);
}

function cancelSchedule() {
  if (scheduleTimer) {
    clearTimeout(scheduleTimer);
    scheduleTimer = null;
    console.log('[Scheduler] Cancelled');
  }
}

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve video files from arbitrary paths (for the player)
app.get('/video', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo', '.m4v': 'video/mp4', '.webm': 'video/webm'
  };
  const mime = mimeTypes[ext] || 'video/mp4';
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mime,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  }
});

// --- API ---

// GET current config + folder videos
app.get('/api/config', (req, res) => {
  const videos = getVideosInFolder(config.loopFolder);
  res.json({ ...config, videos });
});

// POST update config
app.post('/api/config', (req, res) => {
  const { loopFolder, featureFile, featureTime } = req.body;

  if (loopFolder !== undefined) config.loopFolder = loopFolder;
  if (featureFile !== undefined) config.featureFile = featureFile;
  if (featureTime !== undefined) config.featureTime = featureTime;

  saveConfig(config);
  broadcast({ type: 'config_update', config });

  if (config.loopFolder) watchFolder(config.loopFolder);

  res.json({ ok: true, config });
});

// POST start session (activate scheduler + tell player to start loop)
app.post('/api/start', (req, res) => {
  if (!config.loopFolder) {
    return res.status(400).json({ error: 'No loop folder configured' });
  }

  config.status = 'running';
  saveConfig(config);

  const videos = getVideosInFolder(config.loopFolder);
  broadcast({ type: 'play_loop', videos });

  if (config.featureTime && config.featureFile) {
    scheduleFeature(config.featureTime);
  }

  res.json({ ok: true });
});

// POST stop session
app.post('/api/stop', (req, res) => {
  config.status = 'idle';
  saveConfig(config);
  cancelSchedule();
  broadcast({ type: 'stop' });
  res.json({ ok: true });
});

// POST trigger feature immediately (manual override)
app.post('/api/play-feature-now', (req, res) => {
  if (!config.featureFile) {
    return res.status(400).json({ error: 'No feature file configured' });
  }
  cancelSchedule();
  config.status = 'feature';
  saveConfig(config);
  broadcast({ type: 'play_feature', file: config.featureFile });
  res.json({ ok: true });
});

// POST player signals feature ended → back to loop
app.post('/api/feature-ended', (req, res) => {
  config.status = 'running';
  saveConfig(config);
  const videos = getVideosInFolder(config.loopFolder);
  broadcast({ type: 'play_loop', videos });

  // Reschedule for tomorrow if time is set
  if (config.featureTime && config.featureFile) {
    scheduleFeature(config.featureTime);
  }

  res.json({ ok: true });
});

// POST browse folder (lists subfolders + video files)
app.post('/api/browse', (req, res) => {
  const { dir } = req.body;
  const target = dir || require('os').homedir();

  try {
    const entries = fs.readdirSync(target, { withFileTypes: true });
    const folders = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => ({ name: e.name, path: path.join(target, e.name) }));
    const videos = entries
      .filter(e => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
      .map(e => ({ name: e.name, path: path.join(target, e.name) }));
    res.json({ current: target, parent: path.dirname(target), folders, videos });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Start ---
server.listen(PORT, () => {
  console.log(`\n🎬 Cinema Player running`);
  console.log(`   Config UI  → http://localhost:${PORT}`);
  console.log(`   Player     → http://localhost:${PORT}/player.html\n`);
  if (config.loopFolder) watchFolder(config.loopFolder);
});
