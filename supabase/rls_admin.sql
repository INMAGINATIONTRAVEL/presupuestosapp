-- Políticas para usuarios autenticados (agentes/admin)

-- PRESUPUESTOS
create policy "admin_todo_presupuestos"
  on presupuestos for all
  to authenticated
  using (true)
  with check (true);

-- EXTRAS CATÁLOGO
create policy "admin_todo_extras_catalogo"
  on extras_catalogo for all
  to authenticated
  using (true)
  with check (true);

-- PRESUPUESTO EXTRAS
create policy "admin_todo_presupuesto_extras"
  on presupuesto_extras for all
  to authenticated
  using (true)
  with check (true);

-- VIAJEROS
create policy "admin_todo_viajeros"
  on viajeros for all
  to authenticated
  using (true)
  with check (true);

-- CONFIRMACIONES
create policy "admin_todo_confirmaciones"
  on confirmaciones for all
  to authenticated
  using (true)
  with check (true);
