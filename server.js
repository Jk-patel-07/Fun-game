const http = require('http');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const PORT = 8080;
const HTML_FILE = path.join(__dirname, 'index.html');
const EXCEL_FILE = path.join(__dirname, 'Jay_Messages.xlsx');

// Helper to format date in YYYY-MM-DD HH:MM:SS
function getFormattedDateTime() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

const server = http.createServer((req, res) => {
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

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const name = (payload.name || '').trim();
        const message = (payload.message || '').trim();
        const predictedMarks = payload.predictedMarks !== undefined ? Number(payload.predictedMarks) : '';
        const predictionResult = (payload.predictionResult || '').trim();

        if (!name || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name and message are required.' }));
          return;
        }

        // Excel file generation/update using sheetjs
        let data = [];
        if (fs.existsSync(EXCEL_FILE)) {
          try {
            const workbook = xlsx.readFile(EXCEL_FILE);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(worksheet);
          } catch (readErr) {
            console.error("Error reading existing excel file, creating a new database instead:", readErr);
            data = [];
          }
        }

        // Determine next ID
        const nextId = data.length > 0 ? Math.max(...data.map(r => Number(r.ID || 0))) + 1 : 1;

        // Construct new row
        const newRow = {
          'ID': nextId,
          'Date & Time': getFormattedDateTime(),
          'Name': name,
          'Predicted Marks': predictedMarks,
          'Prediction Result': predictionResult,
          'Message': message
        };

        data.push(newRow);

        // Convert data back to Excel sheets and write to file
        const newWorksheet = xlsx.utils.json_to_sheet(data);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Messages');
        xlsx.writeFile(newWorkbook, EXCEL_FILE);

        console.log(`[Excel Db] Appended message ID ${nextId} from ${name}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Message recorded in Jay_Messages.xlsx!' }));
      } catch (err) {
        console.error("Error writing message to Excel file:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to write message to Excel file.' }));
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
  console.log(`Excel database at ${EXCEL_FILE}`);
});
