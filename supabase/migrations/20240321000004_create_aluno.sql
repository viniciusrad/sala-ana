create table public.aluno (
  id uuid not null default gen_random_uuid(),
  nome character varying(150) not null,
  data_nascimento date not null,
  genero character varying(20) null,
  telefone character varying(20) null,
  responsavel_id uuid null,
  endereco text null,
  escola character varying(100) null,
  serie character varying(20) null,
  materia_preferencial character varying(100) null,
  data_cadastro timestamp without time zone null default CURRENT_TIMESTAMP,
  dias_preferenciais character varying(100) null,
  constraint aluno_pkey primary key (id),
  constraint fk_responsavel foreign key (responsavel_id) references responsavel (id) on delete CASCADE
) tablespace pg_default;
