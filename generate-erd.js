const fs = require('fs');
const mermaid = require('mermaid');

mermaid.mermaidAPI.initialize({ startOnLoad: false });
mermaid.mermaidAPI.render('queue-session-erd', fs.readFileSync('docs/queue-session-erd.mermaid', 'utf8'), (svgCode) => {
  const svg = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad:true});</script>
</head>
<body>
  ${svgCode}
</body>
</html>`;

  const puppeteer = require('puppeteer');
  
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(svg);
    await page.screenshot({ path: 'docs/queue-session-erd.png', fullPage: true });
    await browser.close();
  })();
});