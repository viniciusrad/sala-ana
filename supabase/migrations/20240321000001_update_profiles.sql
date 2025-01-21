-- Drop existing table and its dependencies
drop table if exists profiles cascade;

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nome_completo text,
  telefone text,
  tipo_usuario text check (tipo_usuario in ('aluno', 'professor', 'admin')),
  nome_responsavel text,
  telefone_responsavel text,
  email text,
  updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically set updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at(); 