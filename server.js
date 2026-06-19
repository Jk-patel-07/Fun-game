require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const PORT = 8080;
const HTML_FILE = path.join(__dirname, 'index.html');

// MongoDB Configurations
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fun';

async function connectToMongo() {
  try {
    // If already connected, do nothing
    if (mongoose.connection.readyState === 1) return;
    
    await mongoose.connect(MONGO_URI, { dbName: 'fun' });
    console.log(`[Mongoose] Connected successfully to database: "${mongoose.connection.name}"`);
  } catch (err) {
    console.error(`[Mongoose] Connection failed: ${err.message}. Will try to reconnect on incoming request.`);
  }
}

// Initial connection attempt on startup
connectToMongo();

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true
  },
  mark: {
    type: Number,
    min: [0, 'Marks cannot be less than 0.'],
    max: [70, 'Marks cannot be more than 70.']
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  },
  time: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'user', 
  versionKey: false 
});

const User = mongoose.model('User', userSchema);

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve Main Page
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    fs.readFile(HTML_FILE, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: Missing index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // Handle message submission API
  if (req.method === 'POST' && req.url === '/submit-message') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const name = (payload.name || '').trim();
        const message = (payload.message || '').trim();
        const predictedMarks = payload.predictedMarks !== undefined && payload.predictedMarks !== '' ? Number(payload.predictedMarks) : undefined;

        if (!name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name is required.' }));
          return;
        }

        // Reconnect to MongoDB if connection is currently down
        if (mongoose.connection.readyState !== 1) {
          await connectToMongo();
          if (mongoose.connection.readyState !== 1) {
            throw new Error('Database is offline. Triggering LocalStorage fallback.');
          }
        }

        // Create Mongoose document
        const newUser = new User({
          name: name,
          mark: predictedMarks,
          feedback: message
        });

        // Save to MongoDB (validates automatically using schema)
        await newUser.save();
        console.log(`[Mongoose] Saved user: "${name}" to collection: "user"`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Recorded in MongoDB database collection: "user"!' }));
      } catch (err) {
        console.error("[Mongoose] Error saving user:", err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Failed to save user to database.' }));
      }
    });
    return;
  }

  // Fallback for static assets or 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving page on http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${MONGO_URI}`);
});
