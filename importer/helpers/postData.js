import globals from '../../globals.js';

/**
 * An API post function to postData to an endpoint.
 * @param {String} url The endpoint to post the data to.
 * @param {Object} options An object containing the headers for the request.
 * @param {Object} dataObject The data object containing the info to post.
 * @param {Number} retries Retries should be passed as an argument to the function so that it can maintain its value across recursive calls.
 * @param {Number} delay Delay needs to be passed as arugment also to persist incresing value over recursive calls.
 */
export default async function postData(
  url,
  options,
  dataObject,
  retries = 0,
  delay = 2000
) {
  const { inputMethod, inputHeaders } = options;

  try {
    const request = await fetch(url, {
      method: inputMethod,
      headers: {
        ...inputHeaders,
      },
      body: JSON.stringify(dataObject),
    });

    if (!request.ok) {
      //   console.log(await request.json());
      if (retries < globals.maxRetries) {
        console.log(
          `Retrying updating asset status (${retries + 1}/${
            globals.maxRetries
          }) for ${dataObject.url}...`
        );
        await new Promise(r => setTimeout(r, delay));
        return await postData(
          url,
          options,
          dataObject,
          retries + 1,
          delay * 2
        );
      } else {
        console.error(
          `Max retries reached for ${dataObject.url}. Skipping.`
        );
        throw new Error(JSON.stringify(await request.json()));
      }
    } else {
      console.log(`Posted data`);
      return;
    }
  } catch (error) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      fileName: error.fileName,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      description: error.description,
      code: error.code,
    };

    globals.errorLog.add({
      error: errorInfo,
      url: dataObject.url,
    });
  }
}
