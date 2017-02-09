create user app password 'postgres';
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO app;
ALTER DEFAULT PRIVILEGES GRANT ALL ON SEQUENCES TO app;
grant all privileges on database postgres to app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app;

create extension hstore;

create table "user" (
  email text primary key
);

create table "library" (
  library_id serial primary key,
  label text not null,
  url text not null
);

create table user_library (
  email text not null references "user"(email) on delete cascade,
  library_id integer not null references library(library_id) on delete cascade
);

create table track (
  track_id serial primary key,
  title text not null,
  artist text not null,
  album text not null,
  track_num integer,
  length double precision not null,
  formats hstore not null default '',
  library_id integer not null references library(library_id) on delete cascade
);

create table playlist (
  playlist_id serial primary key,
  email text not null references "user"(email) on delete cascade,
  name text not null
);

create table playlist_track (
  playlist_id integer not null references playlist(playlist_id) on delete cascade,
  track_id integer not null references track(track_id) on delete cascade,
  num integer not null
);

--create view library_view as
--select track.*, library.* from library_track
--join library using(library_id)
--join track using(track_id);

create view playlist_view as
select playlist_track.playlist_id, playlist_track.num, track.* from playlist_track
join track using(track_id);

create view my_libraries as
select * from library join user_library using (library_id);

--alter table user_library enable row level security;
--create policy user_library_policy on user_library
--using (current_setting('my.username') = email);

--alter table library enable row level security;
--create policy library_policy on library
--using ((select true from user_library where
--  library.library_id = user_library.library_id
--  and current_setting('my.username') = user_library.email
--)) with check (true);