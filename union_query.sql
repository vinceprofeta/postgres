select s.date, au.first_name, au.last_name, ds.service_name, calendar_service_id,
dc.id as calendar_id, calendar_capacity, dcd.dow, dct.start, dct.end,
(
   select jsonb_agg(bookings)
   from (
      select db.start, db.end
      from bookings db
      where db.booking_calendar_id = dc.id
      and "time"(db.start) between dct.start and dct.end
      and "time"(db."end") between dct.start and dct.end
      and s.date = date(db.start)
   ) bookings
) as bookings,
(
   select jsonb_agg(override)
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
from calendars dc
inner join "calendarRecurringDay" dcd
on dcd.calendar_id = dc.id
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = calendar_service_id
inner join "calendarRecurringTime" dct
on dct.calendar_recurring_day_id = dcd.id
inner join generate_series('2016-08-01 00:00'::timestamp,
                              '2018-09-30 00:00', '1 day') as s(a)
on 1=1
where calendar_service_id = 1
and dcd.dow = EXTRACT(DOW FROM s.date)
group by dcd.id, au.id, ds.id, dct.id, dc.id, s.date, s.a

union

select s.date, au.first_name, au.last_name, ds.service_name, calendar_service_id,
dc.id as calendar_id, calendar_capacity, EXTRACT(DOW FROM s.date) as dow, dcd.start::timestamp::time, dcd.end::timestamp::time,
(
   select jsonb_agg(bookings)
   from (
      select db.start, db.end
      from bookings db
      where db.booking_calendar_id = dc.id
      and "time"(db.start) between "time"(dcd.start) and "time"(dcd.end)
      and "time"(db."end") between "time"(dcd.start) and "time"(dcd.end)
      and db.start::timestamp::date = s.date::timestamp::date
   ) bookings
) as bookings,
(
   select jsonb_agg(override)
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
from calendars dc
inner join users au
on au.id = dc.calendar_agent_id
inner join services ds
on ds.id = calendar_service_id
inner join generate_series('2016-08-01 00:00'::timestamp,
                              '2018-09-30 00:00', '1 day') as s(a)
on 1=1
inner join "calendarScheduleOverride" dcd
on dcd.calendar_id = dc.id and date(dcd.start) = s.date
where calendar_service_id = 1
and dcd.available='t'
group by dcd.id, au.id, ds.id, dcd.id, dc.id, s.date, s.a





