import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import axios from 'axios';
import algoliasearch from 'algoliasearch/reactnative';

const APPLICATION_ID = "826IK76UYZ";
const API_KEY = "301b098906978cde88da93cc688687c2";
const indexName = "demo_ecommerce_query_suggestions";
const sourceIndexName = "demo_ecommerce";

const searchClient = algoliasearch(
  APPLICATION_ID,
  API_KEY
);

const index = searchClient.initIndex(sourceIndexName);

export async function getSuggestions(query) {
    try {
        const res = await axios.post(`https://${APPLICATION_ID}-dsn.algolia.net/1/indexes/${indexName}/query`, {
          params: `query=${query}&hitsPerPage=5`
        }, {
          headers: {
            "X-Algolia-API-Key": API_KEY,
            "X-Algolia-Application-Id": APPLICATION_ID,
          }, 
        })
        // console.log(res.data.hits);
        return res.data.hits;
    } catch(e) {
        console.log(e);
    }
}

export async function setRecentSearches(query, userID) {
    let searches  = [];
    try {
        const res = await index.getObject(userID);
        searches = [...res.searches, query];
        searches = searches.length > 5 ? searches.slice(1) : searches;
        const data = [{ objectID: userID, searches }];
        await index.saveObjects(data);
        return searches;
      } catch(e) {
        console.log(e);
        searches = [query];
        const data = [{ objectID: userID, searches }];
        await index.saveObjects(data);
        return searches;
      }
}

export async function getRecentSearches(userID) {
  try {
    const res = await index.getObject(userID);
    console.log(res)
    return res.searches;
  } catch(e) {
    console.log(e)
  }
}

export async function getTopSearches() {
  try {
    const res = await axios.get(`https://analytics.algolia.com/2/searches?index=${sourceIndexName}&limit=6`, {
      headers: {
        "X-Algolia-API-Key": API_KEY,
        "X-Algolia-Application-Id": APPLICATION_ID,
      }, 
    })
    console.log(res);
    return res.data.searches;
} catch(e) {
    console.log(e.response);
} 
}