/**
 * A helper function to determine if a URL shold be included in the crawl sequence.
 * @param {String} url The request URL string.
 * @param {Array<string>} blockedOptions An array of strings that if matched will be excluded from the crawl.
 * @returns {Boolean}
 */
export default function shouldBlockRequest(url, blockedOptions) {
  return blockedOptions.some(option => url.includes(option));
}
