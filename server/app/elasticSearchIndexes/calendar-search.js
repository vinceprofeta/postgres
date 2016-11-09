var elasticClient = require('../../elasticsearch.js');


export async function queryCalendars(service) {
    client.search({  
      index: ['calendars_index', 'skills_index'],
      body: {
        query: {
          "query_string": {
            "query": 'soccer'
          }
        },
      }
    },function (error, response,status) {
        if (error){
          console.log("search error: "+error)
        }
        else {
          response.hits.hits.forEach(function(hit){
            console.log(hit);
          })
        }
    });
}








