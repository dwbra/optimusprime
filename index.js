import aggregator from './aggregator/index.js';
import importer from './importer/index.js';

// User should be aware that whatever property value they set, this is what will be used in the output.
const dataToRetrieve = [
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

const allData = await aggregator(
  'https://pursuit.unimelb.edu.au/articles/digital-history-machines-are-never-politically-neutral',
  exclues,
  dataToRetrieve
);

console.log(allData);

const urlToPostData = 'https://example.com';
const postOptions = {
  inputMethod: 'POST',
  inputHeaders: {
    'Content-Type': 'application/json',
  },
};

await importer(urlToPostData, postOptions, allData);
