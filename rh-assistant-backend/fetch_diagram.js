const fs = require('fs');
const https = require('https');

const mermaidText = fs.readFileSync('diagram.mmd', 'utf8');
const req = https.request({
  hostname: 'kroki.io',
  port: 443,
  path: '/mermaid/png',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  }
}, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Status Code: ${res.statusCode}`);
    res.resume();
    return;
  }
  const file = fs.createWriteStream('uml_diagram.png');
  res.pipe(file);
  res.on('end', () => {
    console.log('Image saved as uml_diagram.png successfully!');
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.write(mermaidText);
req.end();
