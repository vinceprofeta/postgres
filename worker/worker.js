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
      determineMessage(msg);
      ch.ack(msg);
    }, {noAck: false});


  });
});

// Helper functions
function determineMessage(msg) {
  msg = JSON.parse(msg.content.toString())
   // calendars
   if (msg.route === 'calendar') {
      if (msg.action === 'delete') {
        elastic.deleteCalendar({id: msg.id});
      } else {
        addCalendarToES(msg)
      }
   } 

   // skills
   else if(msg.route === 'skill') {
      if (msg.action === 'delete') {
        elastic.deleteSkill({id: msg.id});
      } else {
        addSkillToES(msg)
      }
   }
}



// Query functions
function addCalendarToES(msg) {
   knex('calendars').where('calendars.id', '=', msg.id)
   .join('services', 'services.id', '=', 'calendars.calendar_service_id')
   .join('users', 'users.id', '=', 'calendars.calendar_agent_id')
   .join('skills', 'skills.id', '=', 'services.service_skill_id')
   .select('users.facebook_user_id', 'users.first_name', 'users.last_name','skills.name as skill_name','calendars.id as calendar_id','calendars.*', 'services.*', st.x('calendars.point').as('x'),  st.y('calendars.point').as('y')) // st.distance('point', point)
   .then((data) => {
      elastic.addCalendar(data[0]);
   })
}

function addSkillToES(msg) {
   knex('skillsToCategories').where('skillsToCategories.id', '=', msg.id)
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



