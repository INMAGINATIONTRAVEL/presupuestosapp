import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(precio) + ' €'
}

export function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
}

export function calcularNoches(inicio: string, fin: string): number {
  const diff = new Date(fin).getTime() - new Date(inicio).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function calcularDias(inicio: string, fin: string): number {
  return calcularNoches(inicio, fin) + 1
}

export function totalViajeros(habitaciones: { adultos: number; ninos: { edad: number }[] }[]): {
  adultos: number
  ninos: number
  total: number
} {
  const adultos = habitaciones.reduce((acc, h) => acc + h.adultos, 0)
  const ninos = habitaciones.reduce((acc, h) => acc + h.ninos.length, 0)
  return { adultos, ninos, total: adultos + ninos }
}
