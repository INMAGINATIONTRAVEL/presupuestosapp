-- ============================================================
-- SCHEMA: Sistema de Presupuestos Privados
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: presupuestos
-- ============================================================
create table presupuestos (
  id                  uuid primary key default uuid_generate_v4(),
  numero              serial unique,                          -- Nº visible: 34072
  token               uuid unique default uuid_generate_v4(), -- Token del link privado

  -- Datos del cliente
  cliente_nombre      text not null,
  cliente_email       text not null,
  cliente_telefono    text,

  -- Datos del viaje
  destino             text not null default 'Disneyland Paris',
  fecha_inicio        date not null,
  fecha_fin           date not null,
  hotel               text not null,
  hotel_imagen_url    text,
  tipo_habitacion     text,
  plan_comidas        text,
  incluye_vuelos      boolean default false,
  detalles_vuelos     jsonb,                                  -- Info flexible de vuelos
  descripcion_oferta  text,                                   -- Texto libre de la oferta especial

  -- Distribución de habitaciones
  habitaciones        jsonb not null default '[]',            -- [{num: 1, adultos: 2, ninos: [{edad: 9}]}]

  -- Precios
  precio_total        numeric(10,2) not null,
  precio_senal        numeric(10,2) not null,                 -- Señal para reservar

  -- Estado
  estado              text not null default 'borrador'
                      check (estado in ('borrador','enviado','visto','confirmado','expirado','cancelado')),
  fecha_expiracion    timestamp with time zone,
  fecha_visto         timestamp with time zone,
  veces_visto         int not null default 0,

  -- Notas internas del agente
  notas_internas      text,

  -- Metadata
  created_at          timestamp with time zone default now(),
  updated_at          timestamp with time zone default now()
);

-- ============================================================
-- TABLA: extras_catalogo
-- Catálogo de extras que gestiona el agente
-- ============================================================
create table extras_catalogo (
  id                  uuid primary key default uuid_generate_v4(),
  nombre              text not null,
  descripcion         text,
  precio_referencia   numeric(10,2) not null default 0,
  imagen_url          text,
  activo              boolean not null default true,
  orden               int not null default 0,
  created_at          timestamp with time zone default now()
);

-- ============================================================
-- TABLA: presupuesto_extras
-- Extras asignados a un presupuesto concreto (precio personalizado)
-- ============================================================
create table presupuesto_extras (
  id                       uuid primary key default uuid_generate_v4(),
  presupuesto_id           uuid not null references presupuestos(id) on delete cascade,
  extra_id                 uuid not null references extras_catalogo(id) on delete cascade,
  precio_personalizado     numeric(10,2) not null,            -- Precio para este viaje concreto
  seleccionado_cliente     boolean not null default false,    -- El cliente lo marcó
  created_at               timestamp with time zone default now(),
  unique(presupuesto_id, extra_id)
);

-- ============================================================
-- TABLA: viajeros
-- Datos de los viajeros por presupuesto (rellenados al confirmar)
-- ============================================================
create table viajeros (
  id                  uuid primary key default uuid_generate_v4(),
  presupuesto_id      uuid not null references presupuestos(id) on delete cascade,
  habitacion_numero   int not null default 1,
  tipo                text not null check (tipo in ('adulto','nino')),
  nombre              text not null,
  apellidos           text not null,
  dni_pasaporte       text,
  edad                int,                                    -- Solo para niños
  created_at          timestamp with time zone default now()
);

-- ============================================================
-- TABLA: confirmaciones
-- Registro cuando el cliente confirma la reserva
-- ============================================================
create table confirmaciones (
  id                  uuid primary key default uuid_generate_v4(),
  presupuesto_id      uuid not null references presupuestos(id) on delete cascade,
  pago_flexible       boolean not null default false,
  notas_cliente       text,                                   -- Cambios que solicita
  telefono_reserva    text,
  fecha_confirmacion  timestamp with time zone default now()
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger presupuestos_updated_at
  before update on presupuestos
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCIÓN: marcar presupuesto como visto
-- ============================================================
create or replace function marcar_visto(p_token uuid)
returns void as $$
begin
  update presupuestos
  set
    estado      = case when estado = 'enviado' then 'visto' else estado end,
    fecha_visto = coalesce(fecha_visto, now()),
    veces_visto = veces_visto + 1
  where token = p_token;
end;
$$ language plpgsql;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table presupuestos       enable row level security;
alter table extras_catalogo    enable row level security;
alter table presupuesto_extras enable row level security;
alter table viajeros           enable row level security;
alter table confirmaciones     enable row level security;

-- El cliente puede leer su presupuesto por token (sin login)
create policy "cliente_lee_por_token"
  on presupuestos for select
  using (true);                                               -- Filtraremos por token en la query

-- El cliente puede crear viajeros y confirmaciones
create policy "cliente_crea_viajeros"
  on viajeros for insert
  with check (true);

create policy "cliente_crea_confirmacion"
  on confirmaciones for insert
  with check (true);

create policy "cliente_lee_extras_presupuesto"
  on presupuesto_extras for select
  using (true);

create policy "cliente_actualiza_extras_seleccionados"
  on presupuesto_extras for update
  using (true);

-- El catálogo de extras es de solo lectura para el cliente
create policy "cliente_lee_catalogo"
  on extras_catalogo for select
  using (activo = true);

-- ============================================================
-- DATOS INICIALES: extras de ejemplo
-- ============================================================
insert into extras_catalogo (nombre, descripcion, precio_referencia, orden) values
  ('Desayuno con personajes Disney', 'Desayuno temático con personajes de Disney', 89.00, 1),
  ('Transfer aeropuerto - hotel', 'Traslado de ida y vuelta aeropuerto/hotel', 120.00, 2),
  ('Cena en restaurante temático', 'Cena en restaurante temático de Disney', 65.00, 3),
  ('Sesión de fotos en el castillo', 'Sesión fotográfica profesional en el castillo', 150.00, 4),
  ('Seguro de viaje', 'Seguro completo para todos los viajeros', 45.00, 5);
