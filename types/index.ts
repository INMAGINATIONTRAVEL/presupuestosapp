export type EstadoPresupuesto = 'borrador' | 'enviado' | 'visto' | 'confirmado' | 'expirado' | 'cancelado'

export interface Habitacion {
  num: number
  adultos: number
  ninos: { edad: number }[]
}

export interface VueloTrayecto {
  label?: string
  origen: string
  fecha: string
  hora?: string
  hora_llegada?: string
  destino: string
}

export interface VueloEstructurado {
  ida: VueloTrayecto
  vuelta: VueloTrayecto
  vuelos_adicionales?: VueloTrayecto[]
  incluye_mochila?: boolean
  incluye_maleta_cabina?: boolean
  observaciones?: string
}

export interface HotelAdicional {
  nombre: string
  imagen_url?: string
  tipo_habitacion?: string
  plan_comidas?: string
  fecha_inicio?: string
  fecha_fin?: string
  observaciones?: string
}

export interface ExtraPersonalizado {
  nombre: string
  descripcion?: string
  imagen_url?: string
  precio: number
}

export interface Presupuesto {
  id: string
  numero: number
  token: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string | null
  destino: string
  fecha_inicio: string
  fecha_fin: string
  hotel: string
  hotel_imagen_url: string | null
  tipo_habitacion: string | null
  plan_comidas: string | null
  incluye_vuelos: boolean
  detalles_vuelos: VueloEstructurado | string | null
  descripcion_oferta: string | null
  observaciones: string | null
  photopass: boolean
  incluye_traslados: boolean
  grupo_id: string | null
  variante: string
  hoteles_adicionales: HotelAdicional[] | null
  extras_personalizados: ExtraPersonalizado[] | null
  habitaciones: Habitacion[]
  precio_total: number
  precio_senal: number
  nota_precio: string | null
  estado: EstadoPresupuesto
  fecha_expiracion: string | null
  fecha_visto: string | null
  veces_visto: number
  notas_internas: string | null
  created_at: string
  updated_at: string
}

export interface ExtraCatalogo {
  id: string
  nombre: string
  descripcion: string | null
  precio_referencia: number
  imagen_url: string | null
  activo: boolean
  es_seguro: boolean
  orden: number
  created_at: string
}

export interface PresupuestoExtra {
  id: string
  presupuesto_id: string
  extra_id: string
  precio_personalizado: number
  seleccionado_cliente: boolean
  extra?: ExtraCatalogo
}

export interface Viajero {
  id?: string
  presupuesto_id?: string
  habitacion_numero: number
  tipo: 'adulto' | 'nino'
  nombre: string
  apellidos: string
  dni_pasaporte: string
  fecha_caducidad_doc?: string
  fecha_nacimiento?: string
  edad?: number | null
}

export interface Confirmacion {
  presupuesto_id: string
  pago_flexible: boolean
  notas_cliente: string | null
  telefono_reserva: string | null
}

// Para la página del cliente — presupuesto completo con extras
export interface PresupuestoCompleto extends Presupuesto {
  extras: PresupuestoExtra[]
}
