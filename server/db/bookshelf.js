var knex = require('./knex')
var Bookshelf = require('bookshelf')(knex);
var fs = require('fs');

var models = fs.readdirSync('server/app/models')
try {
  models = fs.readdirSync('server/app/models')
} catch(err) {}

if (!models) {
  models = fs.readdirSync('dist/app/models')
}

Bookshelf.plugin('visibility');
Bookshelf.plugin('registry');

models.forEach(function(model) {
  if (model.indexOf('.js') > -1) {
    require('../app/models/' + model)(Bookshelf)
  }
})

module.exports = Bookshelf
