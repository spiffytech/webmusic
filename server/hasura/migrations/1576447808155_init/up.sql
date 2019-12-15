CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.archive_files (
    identifier text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    file jsonb NOT NULL
);
CREATE TABLE public.archive_identifiers (
    identifier text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone
);
CREATE TABLE public.archive_metadata (
    identifier text NOT NULL,
    metadata jsonb NOT NULL
);
ALTER TABLE ONLY public.archive_files
    ADD CONSTRAINT archive_files_pkey PRIMARY KEY (identifier, name);
ALTER TABLE ONLY public.archive_identifiers
    ADD CONSTRAINT archive_identifiers_pkey PRIMARY KEY (identifier);
ALTER TABLE ONLY public.archive_metadata
    ADD CONSTRAINT archive_metadata_pkey PRIMARY KEY (identifier);
CREATE TRIGGER set_public_archive_files_updated_at BEFORE UPDATE ON public.archive_files FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_archive_files_updated_at ON public.archive_files IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public.archive_files
    ADD CONSTRAINT archive_files_identifier_fkey FOREIGN KEY (identifier) REFERENCES public.archive_identifiers(identifier) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.archive_metadata
    ADD CONSTRAINT archive_metadata_identifier_fkey FOREIGN KEY (identifier) REFERENCES public.archive_identifiers(identifier) ON UPDATE CASCADE ON DELETE CASCADE;
