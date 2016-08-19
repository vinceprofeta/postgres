var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: process.env.BONSAI_URL || 'localhost:9200',
  // log: 'trace'
});

client.ping({
    requestTimeout: 30000,
    hello: "elasticsearch"
  },
  function (error) {
    if (error) {
      console.error('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  }
);

module.exports = client;  

