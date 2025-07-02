#!/usr/bin/env node
// Usage: npm install puppeteer-extra puppeteer-extra-plugin-stealth puppeteer

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');

puppeteer.use(Stealth());

(async () => {
  // Accept full page URLs as arguments
  const targets = process.argv.slice(2);
  if (!targets.length) {
    console.error('Usage: node crawler.js <pageUrl1> <pageUrl2> ...');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
  );

  const results = [];

  for (const pageUrl of targets) {
    console.log(`\n[Crawling] page: ${pageUrl}`);
    const targetUrl = pageUrl;
    const found = { page: targetUrl, iframeSrc: null, videoSrcs: [], m3u8: [] };

    // Listen for HLS playlist network responses
    const onResponse = response => {
      const url = response.url();
      if (url.includes('.m3u8')) {
        found.m3u8.push(url);
      }
    };
    page.on('response', onResponse);

    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      // Extract first iframe src if present
      const iframeSrc = await page.$eval('iframe[src]', el => el.src).catch(() => null);
      found.iframeSrc = iframeSrc;
      // Extract video element srcs if present
      const videoSrcs = await page.$$eval('video[source], video', els =>
        els.map(v => (v.currentSrc || (v.querySelector('source')?.src) || v.getAttribute('src') || '').trim())
          .filter(src => !!src)
      ).catch(() => []);
      found.videoSrcs = videoSrcs;

      // Wait for potential XHRs to complete
      await page.waitForTimeout(3000);
    } catch (err) {
      console.error(`Error loading ${targetUrl}:`, err.message);
    } finally {
      page.removeListener('response', onResponse);
    }

    console.log('Result:', JSON.stringify(found, null, 2));
    results.push(found);
  }

  await browser.close();

  // Write to file
  const outPath = path.resolve(process.cwd(), 'crawl-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved results to ${outPath}`);
})(); 