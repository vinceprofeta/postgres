var amqp = require('amqplib/callback_api');
var knex = require('./db/knex');
var st = require('knex-postgis')(knex);

var elastic = require('./elasticSearchIndexes/services-index.js');
var client = require('./elasticsearch.js');


amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    

    var q = 'worker_queue';
    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {      
      addCalendarToES(msg.content);
      ch.ack(msg);
    }, {noAck: false});


  });
});

function determineMessage(msg) {
   if (msg.route === 'calendar') {
      addCalendarToES(msg)
   } else if(msg.route === 'skill') {
      addSkillToES(msg)
   }
}


function addCalendarToES(msg) {
   knex('calendars').where('calendars.id', '=', 1)
   .join('services', 'services.id', '=', 'calendars.calendar_service_id')
   .join('users', 'users.id', '=', 'calendars.calendar_agent_id')
   .join('skills', 'skills.id', '=', 'services.service_skill_id')
   .select('users.facebook_user_id', 'users.first_name', 'users.last_name','skills.name as skill_name','calendars.id as calendar_id','calendars.*', 'services.*', st.x('calendars.point').as('x'),  st.y('calendars.point').as('y')) // st.distance('point', point)
   .then((data) => {
      elastic.addCalendar(data[0]);
   })
}

function addSkillToES(msg) {
   knex('skillsToCategories').where('skillsToCategories.id', '=', 1)
   .join('skillCategories', 'skillCategories.id', '=', 'skillsToCategories.skill_category')
   .join('skills', 'skills.id', '=', 'skillsToCategories.skill_category')
   .select('skillCategories.id','skillCategories.name as skill_category',  'skills.name as skill_name', 'skills.description as skill_description')
   .then((data) => {
      elastic.addSkill(data[0]);
   })
}


// Mappings

elastic.indexExists('calendars_index').then(function (exists) {
  if (!exists) {
    return elastic.initIndex('calendars_index').then(elastic.initServiceMapping)
  }
})

elastic.indexExists('skills_index').then(function (exists) {
  if (!exists) {
    return elastic.initIndex('skills_index').then(elastic.initSkillMapping)
  }
})



