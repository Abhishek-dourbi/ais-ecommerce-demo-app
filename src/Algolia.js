import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import axios from 'axios';
import algoliasearch from 'algoliasearch/reactnative';

const APPLICATION_ID = "826IK76UYZ";
const API_KEY = "301b098906978cde88da93cc688687c2";
const indexName = "demo_ecommerce";

const searchClient = algoliasearch(
  APPLICATION_ID,
  API_KEY
);

const index = searchClient.initIndex(indexName);

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
        return res.data.hits;
    } catch(e) {
        console.log(e);
    }
}

export async function setRecentSearches(query, userID) {
    try {
        const res = await index.getObject(userID);
        let searches = [...res.searches, query];
        searches = searches.length > 5 ? searches.slice(1) : searches;
        const data = [{ objectID: userID, searches }];
        const result = await index.saveObjects(data);
        return searches;
      } catch(e) {
        console.log(e);
        const data = [{ objectID: userID, searches: [query] }];
        const result = await index.saveObjects(data);
        return searches;
      }
}

export async function getRecentSearches(userID) {
    const res = await index.getObject(userID);
    console.log(res)
    return res.searches;
}