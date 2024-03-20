import postData from './helpers/postData';

/**
 * The importer function to handle posting each object of data into the endpoint.
 * @param {String} url The url endpoint to post the data to.
 * @param {*} options The headers to add to the request.
 * @param {*} dataToPost The array of objects returned from the aggregator.
 */
export default async function importer(url, options, dataToPost) {
  for (const object of dataToPost) {
    await postData(url, options, object);
    return;
  }
}
