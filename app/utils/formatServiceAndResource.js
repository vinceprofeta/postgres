var bookshelf = require('../../db/bookshelf');
var knex = require('../../db/knex');
var st = require('knex-postgis')(knex);

function formatResourceAndService(user, service, resource) {
  service = service || {};
  if (resource) {
     resource = {
      resourceName: resource.name || 'instructor',
      app_fee_flat_fee_take: 0,
      booking_flat_fee_take: 0,
      description: resource.description || 'description',
      point: resource.long && resource.lat ? st.geomFromText(`Point(${resource.long} ${resource.lat})`, 4326) : null,
      cancellation_policy_percent_take: 0,
      cancellation_policy_flat_fee_take: 0,
      cancellation_policy_window: 0,
      street_address: resource.street,
      city: resource.city,
      state: resource.state,
      zipcode: resource.zipcode,
      phone: resource.phone,
      email: resource.email,
      website: resource.website,
      timezone: 'test'
    }
  }

  service = {
    service_description: service.description || 'no description',
    service_type: service.description || 'type',
    service_name: service.name,
    active: false,
    image: service.image,
    service_capacity: service.capacity ? Number(service.capacity) : 1,
    service_duration: service.duration || 30,
    service_price: service.price || 500,
    service_skill_id: service.skill,
    equipment: JSON.stringify(service.equipment),
    skill_level: JSON.stringify(service.skill_level),
    point: service.long && service.lat ? st.geomFromText(`Point(${service.long} ${service.lat})`, 4326) : null
  }


  return {
    service,
    resource
  }
}


module.exports = formatResourceAndService;


