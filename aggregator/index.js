import { PlaywrightCrawler } from 'crawlee';
import shouldBlockRequest from './helpers/shouldBlockRequest.js';

/* Data Structure
[
  {heading: "h1"},
  {thumbnail: ".specialImage img"},
  {content: ".content-div"}
]
*/

/**
 *
 * @param {String} primaryUrl The url to initialise the crawl with.
 * @param {Array<string>} urlsToSkip An array of strings to exlude from the crawl.
 * @param {Array<object>} dataToStore An array of objects containing key value pairs to get and store data with.
 */
async function aggregator(primaryUrl, urlsToSkip, dataToStore) {
  // PlaywrightCrawler crawls the web using a headless
  // browser controlled by the Playwright library.
  const crawler = new PlaywrightCrawler({
    // Use the requestHandler to process each of the crawled pages.

    async requestHandler({ request, page, enqueueLinks, log, pushData }) {
      let retrievedData = {};

      for (const dataObj of dataToStore) {
        const method = dataObj.method;
        const methodValue = dataObj.methodInput || '';
        for (const [key, value] of Object.entries(dataObj.data)) {
          try {
            // Property already exists, skip processing so as to not override the data.
            if (key in retrievedData) {
              console.log(`Property ${key} already exists. Skipping.`);
              continue;
            }

            const query = await page.waitForSelector(value);
            const result = query ? await query[method](methodValue) : null;
            retrievedData[key] = result;
            retrievedData['url'] = request.loadedUrl;
          } catch (error) {
            console.error(`Error processing ${key}: ${error.message}`);
          }
        }
      }

      await pushData(retrievedData);

      // await page.waitForSelector('.product-item > a');
      // Save results as JSON to ./storage/datasets/default
      // await pushData({ title, url: request.loadedUrl });

      // Extract links from the current page
      // and add them to the crawling queue.
      await enqueueLinks({
        transformRequestFunction(req) {
          // ignore anything included in the urlsToSkip array.
          if (shouldBlockRequest(req.url, urlsToSkip)) return false;
          return req;
        },
      });
    },
    // This function is called when the crawling of a request failed too many times
    async failedRequestHandler({ request }) {
      await Dataset.pushData({
        url: request.url,
        succeeded: false,
        errors: request.errorMessages,
      });
    },
    // Comment this option to scrape the full website.
    maxRequestsPerCrawl: 5,
    maxRequestRetries: 5,
    // Uncomment this option to see the browser window.
    // headless: false,
  });

  // Add first URL to the queue and start the crawl.
  await crawler.run([primaryUrl]);
}

// User should be aware that whatever property value they set, this is what will be used in the output.
const fakeInputs = [
  {
    data: {
      title: 'h1.pr-article-header__title',
    },
    method: 'textContent',
  },
  {
    data: {
      summary: 'p.pr-article-header__intro',
    },
    method: 'textContent',
  },
  {
    data: {
      authorName: '.pr-academic__name',
    },
    method: 'textContent',
  },
  {
    data: {
      authorRole: '.pr-academic__role',
    },
    method: 'textContent',
  },
  {
    data: {
      authorLink: 'a.pr-academic',
    },
    method: 'getAttribute',
    methodInput: 'href',
  },
  // Add more objects with different methods if needed
];

//Exlude urls that contain or end in
const exclues = ['.pdf', '.js', '.css'];

await aggregator(
  'https://pursuit.unimelb.edu.au/articles/digital-history-machines-are-never-politically-neutral',
  exclues,
  fakeInputs
);
