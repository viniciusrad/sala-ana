-- Add new columns if they don't exist
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'nome_responsavel') then
        alter table profiles add column nome_responsavel text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'telefone_responsavel') then
        alter table profiles add column telefone_responsavel text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'tipo_usuario') then
        alter table profiles add column tipo_usuario text check (tipo_usuario in ('aluno', 'professor', 'admin'));
    end if;
end $$;

-- Ensure RLS is enabled
alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- Create or recreate policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create or replace the updated_at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop and recreate the trigger
drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at(); 