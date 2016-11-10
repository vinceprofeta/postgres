var elasticClient = require('../../elasticsearch.js');
var Promise = require('bluebird');

export async function queryCalendars(query) {
  return new Promise((resolve, reject) => {
    elasticClient.search({  
      index: ['calendars_index', 'skills_index'],
      body: {
        query: {
          "query_string": {
            "query": query
          }
        },
      }
    },function (error, response,status) {
        if (error){
          console.log("search error: "+error)
          reject("search error: "+error);
        }
        else {
          resolve(response.hits.hits);
        }
    });
  })
}








