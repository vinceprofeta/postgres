var elasticClient = require('../elasticsearch.js');
// var indexName = "services_index";

// types
  // Users
  // Services


/**
* Delete an existing index
*/
function deleteIndex(indexName) {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;



/**
* create the index
*/
function initIndex(indexName) {
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;



/**
* check if the index exists
*/
function indexExists(indexName) {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;





/**
* Get suggestions
*/
function getSuggestions(input) {
    return elasticClient.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "suggest",
                    fuzzy: true
                }
            }
        }
    })
}
exports.getSuggestions = getSuggestions;




// _________________________________________________________________



/**
* init mapping for calendar
*/
function initCalendarMapping() {
    return elasticClient.indices.putMapping({
        index: 'calendars_index',
        type: "calendar",
        body: {
            properties: {
                service_name: { type: "string" },
                service_description: { type: "string" },
                service_image: { type: "image" },
                service_duration: { type: "number" },
                
                service_skill: { type: "string" },
                service_skill_level: {
                  type : "object",
                  properties: {
                    beginner: {"type" : "boolean"},
                    intermediate: {"type" : "boolean"},
                    advanced: {"type" : "boolean"}
                  }
                },

                calendar_id: { type: "number" },
                calendar_price: { type: "number" },
                calendar_capacity: { type: "number" },

                agent_name: { type: "string" },
                agent_facebook_user_id: { type: "string" },
                approved_calendar: { type: "boolean" }, // boolean

                calendar_point: {
                  type: 'geo_point',
                  fielddata: {
                    format: 'compressed',
                    precision: '1cm'
                  }
                },

                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initCalendarMapping = initCalendarMapping;

/**
* add calendar
*/
function addCalendar(calendar) {
    return elasticClient.index({
        index: 'calendars_index',
        type: "calendar",
        id: calendar.calendar_id,
        body: {
            service_name: calendar.service_name,
            service_description: calendar.service_description,
            service_image: calendar.image,
            service_duration: calendar.service_duration,
            
            service_skill: calendar.skill_name,
            service_skill_level: calendar.skill_level,

            calendar_id: calendar.calendar_id,
            calendar_price: calendar.calendar_price || calendar.service_price,
            calendar_capacity: calendar.calendar_capacity || calendar.service_capacity,

            agent_name: calendar.first_name + ' ' + calendar.last_name,
            agent_facebook_user_id: calendar.facebook_user_id,
            approved_calendar: calendar.approved,

            calendar_point: {
              lat: calendar.x,
              lon: calendar.y
            },


            suggest: {
                input: calendar.service_name.split(" ").concat(calendar.first_name + ' ' + calendar.last_name),
                output: calendar.title,
                payload: calendar || {}
            }
        }
    });
}
exports.addCalendar = addCalendar;


/**
* delete calendar
*/

function deleteCalendar(calendar) {
  return elasticClient.delete({
    index: 'calendars_index',
    type: "calendar",
    id: calendar.calendar_id
  });
}
exports.deleteCalendar = deleteCalendar;



// _________________________________________________________________


/**
* init mapping for service
*/
function initSkillMapping() {
    return elasticClient.indices.putMapping({
        index: 'skills_index',
        type: { type: "string" },
        id: { type: "number" },
        body: {
            properties: {
                skill_name: { type: "string" },
                skill_description: { type: "string" },
                skill_category: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initSkillMapping = initSkillMapping;



/**
* add skill
*/
function addSkill(skill) {
  return elasticClient.index({
    index: 'skills_index',
    type: skill.skill_category,
    id: skill.id,
    body: {
      skill_name: skill.skill_name,
      skill_description: skill.skill_description,
      skill_category: skill.skill_category,
      suggest: {
        input: skill.skill_name.split(" ").concat(skill.skill_category.split(" ")),
        output: skill.skill_name,
        payload: skill || {}
      }
    }
  });
}
exports.addSkill = addSkill;



/**
* delete skill
*/

function deleteSkill(skill) {
  return elasticClient.delete({
    index: 'skills_index',
    type: skill.category,
    id: skill.calendar_id
  });
}
exports.deleteSkill = deleteSkill;




// _________________________________________________________________







