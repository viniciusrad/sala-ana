-- Allow admins to create reports for any student
create policy "Admins podem criar relatorios para qualquer aluno"
  on relatorios for insert
  with check (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
      and profiles.tipo_usuario = 'admin'
    )
  );
