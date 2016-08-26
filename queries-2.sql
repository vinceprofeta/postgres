# Calendar schedule for instructor 6
select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id, dcd.dow, dct.*
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
where dc.calendar_agent_id = 1

select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id, dcd.dow, dct.* 
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
where dc.calendar_agent_id = 1 and dc.calendar_service_id = 1



# is user_id 6 available to make schedule from 3-5 on tuesday (user is instructor)
# if count > 0, there is a conflict
# to check individual service conflict - add "and calendar_service_id = 13" to where clause
select count(1)
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
where dc.calendar_agent_id = 1 and dcd.dow = 2 and (
  (dct.start > TO_TIMESTAMP('06:00:00', 'HH24:MI:SS')::TIME and dct.start < TO_TIMESTAMP('07:00:00', 'HH24:MI:SS')::TIME)
  or 
  (dct.end > TO_TIMESTAMP('06:00:00', 'HH24:MI:SS')::TIME and dct.start < TO_TIMESTAMP('07:00:00', 'HH24:MI:SS')::TIME)
  or 
  (dct.start <= TO_TIMESTAMP('06:00:00', 'HH24:MI:SS')::TIME and dct.end >= TO_TIMESTAMP('07:00:00', 'HH24:MI:SS')::TIME)
)


# check instructor schedule on day of week

select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id, dcd.dow, dct.*
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
where dc.calendar_agent_id = 6
and dcd.dow = EXTRACT(DOW FROM TIMESTAMP '2016-08-19 16:41:12.15397-05');






# test insert booking

-- insert into booking (booking_user_id, calendar_id, "end", start, created, updated)
-- values (5, 10, '2016-08-19 03:00:00', '2016-08-19 04:00:00', now(), now())


# For a given calendar and service, get the availability and bookings for a given day
# the bookings column shows all of the bookings within that window, but it doesn not limit based on
# capacity so you would need some client side / app side logic


select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id,
dc.id as calendar_id, dc.calendar_capacity, dcd.dow, dct.*,
(
   select json_agg(bookings)
   from (
      select db.start, db.end, count(enrolled)
      from bookings db
      inner join (
        select booking_id, booking_user_id
        from "enrolledUsers" eu
        group by eu.id
      ) enrolled on euu.booking_id = db.id
      where db.booking_calendar_id = dc.id
      and "time"(db.start) between dct.start and dct.end
      and "time"(db."end") between dct.start and dct.end
      group by db.start, db.end
   ) bookings
) as bookings
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
where dc.calendar_agent_id = 1 and dc.calendar_service_id = 1
and dcd.dow = EXTRACT(DOW FROM TIMESTAMP '2016-08-19 16:41:12.15397-05')
group by dcd.id, au.id, ds.id, dct.id, dc.id


# to turn this into on a monthly basis, you could simply do the following
# where we generate a series of dates to join on, then use those dates
# to check agains the day of week. This is also how you would do the overrides
select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id,
dc.id as calendar_id, dc.calendar_capacity, dcd.dow, dct.*, s.date,
(
   select json_agg(bookings)
   from (
      select db.start, db.end
      from bookings db
      where db.booking_calendar_id = dc.id
      -- and s.date = date(db.start)
      and db.start::timestamp::date = s.date::timestamp::date
      and "time"(db.start) between dct.start and dct.end
      and "time"(db."end") between dct.start and dct.end
   ) bookings
) as bookings
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
inner join generate_series('2016-08-01 00:00'::timestamp, '2016-09-30 00:00', '1 day') as s(a)
on 1=1
where dc.calendar_agent_id = 1 and dc.calendar_service_id = 1
and dcd.dow = EXTRACT(DOW FROM s.date)
group by dcd.id, au.id, ds.id, dct.id, dc.id, s.date, s.a
order by s.date desc


-- select * from "calendarScheduleOverride" cso
-- inner join generate_series('2016-08-31 00:00'::timestamp, '2016-09-30 00:00', '1 day') as s(a)
-- on 1=1
-- where cso.start::timestamp::date = s.date::timestamp::date



-- select cso.start::timestamp::date, cso.start::timestamp::time, cso.end::timestamp::time 
-- from "calendarScheduleOverride" cso
-- inner join generate_series('2016-08-01 00:00'::timestamp, '2016-09-30 00:00', '1 day') as s(a)
-- on 1=1
-- where cso.start::timestamp::date = s.date::timestamp::date


select au.first_name, au.last_name, ds.service_name, dc.calendar_service_id,
dc.id as calendar_id, dc.calendar_capacity, dcd.dow, dct.*, cso.available, s.date,
cso.start::timestamp::date as cso_date, cso.start::timestamp::time as cso_start, cso.end::timestamp::time as cso_end,
(
   select json_agg(bookings)
   from (
      select db.start, db.end
      from bookings db
      where db.booking_calendar_id = dc.id
      -- and s.date = date(db.start)
      and db.start::timestamp::date = s.date::timestamp::date
      and "time"(db.start) between dct.start and dct.end
      and "time"(db."end") between dct.start and dct.end
   ) bookings
) as bookings
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = dc.calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
inner join "calendarScheduleOverride" cso
on cso.calendar_id = dc.id
inner join generate_series('2016-08-01 00:00'::timestamp, '2016-09-30 00:00', '1 day') as s(a)
on 1=1
where dc.calendar_agent_id = 1 and dc.calendar_service_id = 1
and dcd.dow = EXTRACT(DOW FROM s.date)

and cso.start::timestamp::date = s.date::timestamp::date
-- and cso.available != false

-- or cso.start::timestamp::date = s.date::timestamp::date
-- and cso.available = true

group by dcd.id, au.id, ds.id, dct.id, dc.id, s.a, s.date, cso.start, cso.end, cso.available
order by s.date desc







-- ALLLLLLL


select s.date, au.first_name, au.last_name, ds.name, calendar_service_id,
dc.id as calendar_id, calendar_capacity, dcd.dow, dct.start, dct.end,
(
   select json_agg(booking)
   from (
      select db.start, db.end
      from booking db
      where db.calendar_id = dc.id
      and "time"(db.start) between dct.start and dct.end
      and "time"(db."end") between dct.start and dct.end
      and s.date = date(db.start)
   ) booking
) as bookings,
(
   select json_agg(override)
   from (
      select cso.start, cso.end
      from "calendarScheduleOverride" cso
      where cso.calendar_id = dc.id
      and "time"(cso.start) between dct.start and dct.end
      and "time"(cso."end") between dct.start and dct.end
      and s.date = date(cso.start)
      and cso.available='f'
   ) override
) as unavailable_overrides
from calendar dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join auth_user au
on au.id = dc.user_id
inner join service ds
on ds.id = calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
inner join generate_series('2016-08-01 00:00'::timestamp,
                              '2016-08-31 00:00', '1 day') as s(a)
on 1=1
where dc.user_id = 6 and calendar_service_id = 8
and dcd.dow = EXTRACT(DOW FROM s.date)
group by dcd.id, au.id, ds.id, dct.id, dc.id, s.date, s.a

union

select s.date, au.first_name, au.last_name, ds.name, calendar_service_id,
dc.id as calendar_id, calendar_capacity, EXTRACT(DOW FROM s.date) as dow, dcd.start, dcd.end,
(
   select json_agg(booking)
   from (
      select db.start, db.end
      from booking db
      where db.calendar_id = dc.id
      and "time"(db.start) between "time"(dcd.start) and "time"(dcd.end)
      and "time"(db."end") between "time"(dcd.start) and "time"(dcd.end)
      and s.date = date(db.start)
   ) booking
) as bookings,
(
   select json_agg(override)
   from (
      select cso.start, cso.end
      from "calendarScheduleOverride" cso
      where cso.calendar_id = dc.id
      and "time"(cso.start) between "time"(dcd.start) and "time"(dcd.end)
      and "time"(cso."end") between "time"(dcd.start) and "time"(dcd.end)
      and s.date = date(cso.start)
      and cso.available='f'
   ) override
) as unavailable_overrides
from calendar dc
inner join auth_user au
on au.id = dc.user_id
inner join service ds
on ds.id = calendar_service_id
inner join generate_series('2016-08-01 00:00'::timestamp,
                              '2016-08-31 00:00', '1 day') as s(a)
on 1=1
inner join "calendarScheduleOverride" dcd
on dcd.calendar_id = dc.id and date(dcd.start) = s.date
where dc.user_id = 6 and calendar_service_id = 8
and dcd.available='t'
group by dcd.id, au.id, ds.id, dcd.id, dc.id, s.date, s.a





