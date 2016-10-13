"use strict";

var elasticClient = require('../../elasticsearch.js');
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
    });
}
exports.getSuggestions = getSuggestions;

// _________________________________________________________________


/**
* init mapping for calendar
*/
function initCalendarMapping() {
    return elasticClient.indices.putMapping({
        index: 'services_index',
        type: "calendar",
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
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
        index: 'services_index',
        type: "calendar",
        id: calendar.id,
        body: {
            title: calendar.title,
            content: calendar.content,
            suggest: {
                input: calendar.title.split(" "),
                output: calendar.title,
                payload: calendar.metadata || {}
            }
        }
    });
}
exports.addCalendar = addCalendar;

// _________________________________________________________________


/**
* init mapping for service
*/
function initServiceMapping() {
    return elasticClient.indices.putMapping({
        index: 'services_index',
        type: "service",
        id: { type: "number" },
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                service_resource_id: { type: "string" },
                service_skill_id: { type: "string" },
                // skill and resource populated

                serviceName: { type: "string" },
                serviceDescription: { type: "string" },
                active: { type: "boolean" },
                serviceType: { type: "string" },
                image: { type: "string" },
                serviceCapacity: { type: "number" },
                serviceDuration: { type: "number" },
                servicePrice: { type: "number" },
                deleted: { type: "boolean" },
                point: { type: "string" },
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
exports.initServiceMapping = initServiceMapping;

/**
* add service
*/
function addService(service) {
    return elasticClient.index({
        index: 'services_index',
        type: "service",
        id: service.id,
        body: {
            resource: service.resource,
            skill: service.skill,
            // skill and resource populated

            serviceName: service.serviceName,
            serviceDescription: service.serviceDescription,
            active: service.active,
            serviceType: service.serviceType,
            image: service.image,
            serviceCapacity: service.serviceCapacity,
            serviceDuration: service.serviceDuration,
            servicePrice: service.servicePrice,
            deleted: service.deleted,
            point: service.point,

            suggest: {
                input: service.serviceName.split(" "),
                output: service.serviceName,
                payload: service.metadata || {}
            }
        }
    });
}
exports.addService = addService;

// _________________________________________________________________