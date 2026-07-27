export function emailAgenteHTML({
  clienteNombre,
  clienteEmail,
  clienteTelefono,
  destino,
  hotel,
  fechaInicio,
  fechaFin,
  precioTotal,
  extrasSeleccionados,
  pagoFlexible,
  notasCliente,
  telefonoReserva,
  direccionTitular,
  viajeros,
  linkAdmin,
}: {
  clienteNombre: string
  clienteEmail: string
  clienteTelefono?: string | null
  destino: string
  hotel: string
  fechaInicio: string
  fechaFin: string
  precioTotal: string
  extrasSeleccionados: { nombre: string; precio: string }[]
  pagoFlexible: boolean
  notasCliente?: string | null
  telefonoReserva?: string | null
  direccionTitular?: string | null
  viajeros?: { nombre: string; apellidos: string; tipo: string; edad?: number | null; dni_pasaporte?: string; fecha_nacimiento?: string; fecha_caducidad_doc?: string; habitacion_numero: number }[]
  linkAdmin: string
}) {
  const extrasHTML = extrasSeleccionados.length > 0
    ? extrasSeleccionados.map(e =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #f0f0f0;">✅ ${e.nombre}</td>
          <td style="padding:8px 0;font-size:14px;color:#F5A623;font-weight:700;text-align:right;border-bottom:1px solid #f0f0f0;">${e.precio}</td>
        </tr>`
      ).join('')
    : `<tr><td colspan="2" style="padding:8px 0;font-size:14px;color:#999;">Ningún extra seleccionado</td></tr>`

  const viajerosHTML = viajeros && viajeros.length > 0
    ? viajeros.map((v, i) => `
        <tr>
          <td colspan="2" style="padding:10px 0 4px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:${v.tipo === 'nino' ? '#F5A623' : '#1C1C2E'};">
              ${v.tipo === 'nino' ? `😊 Niño ${v.edad ? `(${v.edad} años)` : ''}` : `👤 Adulto ${i + 1}`} — Hab. ${v.habitacion_numero}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:2px 0 2px 12px;font-size:13px;color:#666;width:40%;">Nombre</td>
          <td style="padding:2px 0;font-size:13px;color:#1C1C2E;font-weight:600;">${v.nombre} ${v.apellidos}</td>
        </tr>
        ${v.fecha_nacimiento ? `<tr><td style="padding:2px 0 2px 12px;font-size:13px;color:#666;">F. nacimiento</td><td style="padding:2px 0;font-size:13px;color:#1C1C2E;">${v.fecha_nacimiento}</td></tr>` : ''}
        ${v.dni_pasaporte ? `<tr><td style="padding:2px 0 2px 12px;font-size:13px;color:#666;">DNI/Pasaporte</td><td style="padding:2px 0;font-size:13px;color:#1C1C2E;">${v.dni_pasaporte}</td></tr>` : ''}
        ${v.fecha_caducidad_doc ? `<tr><td style="padding:2px 0 2px 12px;font-size:13px;color:#666;">Caduca</td><td style="padding:2px 0;font-size:13px;color:#1C1C2E;">${v.fecha_caducidad_doc}</td></tr>` : ''}
      `).join('<tr><td colspan="2" style="border-bottom:1px solid #f0f0f0;padding:4px 0;"></td></tr>')
    : `<tr><td colspan="2" style="padding:8px 0;font-size:14px;color:#999;">Sin datos de viajeros</td></tr>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nueva confirmación de reserva</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#ffffff;border-bottom:4px solid #E8445A;padding:32px 40px 24px;text-align:center;">
            <p style="margin:0 0 6px;color:#E8445A;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Inmagination Travel · Panel de Agente</p>
            <h2 style="margin:0;color:#1C1C2E;font-size:24px;font-weight:700;">🎉 Nueva confirmación de reserva</h2>
          </td>
        </tr>

        <!-- CLIENTE -->
        <tr>
          <td style="padding:32px 40px 8px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#E8445A;text-transform:uppercase;letter-spacing:2px;">Datos del cliente</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#666;width:40%;border-bottom:1px solid #f0f0f0;">Nombre</td>
                <td style="padding:8px 0;font-size:14px;color:#1C1C2E;font-weight:700;border-bottom:1px solid #f0f0f0;">${clienteNombre}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#666;border-bottom:1px solid #f0f0f0;">Email</td>
                <td style="padding:8px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #f0f0f0;">${clienteEmail}</td>
              </tr>
              ${clienteTelefono ? `<tr><td style="padding:8px 0;font-size:14px;color:#666;border-bottom:1px solid #f0f0f0;">Teléfono</td><td style="padding:8px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #f0f0f0;">${clienteTelefono}</td></tr>` : ''}
              ${telefonoReserva ? `<tr><td style="padding:8px 0;font-size:14px;color:#666;border-bottom:1px solid #f0f0f0;">Tel. confirmación</td><td style="padding:8px 0;font-size:14px;color:#1C1C2E;font-weight:700;border-bottom:1px solid #f0f0f0;">${telefonoReserva}</td></tr>` : ''}
              ${direccionTitular ? `<tr><td style="padding:8px 0;font-size:14px;color:#666;border-bottom:1px solid #f0f0f0;">Dirección</td><td style="padding:8px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #f0f0f0;">${direccionTitular}</td></tr>` : ''}
              ${notasCliente ? `<tr><td style="padding:8px 0;font-size:14px;color:#666;vertical-align:top;">Notas</td><td style="padding:8px 0;font-size:14px;color:#1C1C2E;font-style:italic;">"${notasCliente}"</td></tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- VIAJEROS -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#1C1C2E;text-transform:uppercase;letter-spacing:2px;">👥 Viajeros</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${viajerosHTML}
            </table>
          </td>
        </tr>

        <!-- VIAJE -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <div style="background:#f8f8fc;border-radius:12px;padding:20px;border-left:4px solid #1C1C2E;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#1C1C2E;text-transform:uppercase;letter-spacing:2px;">Viaje</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;width:40%;">Destino</td>
                  <td style="padding:6px 0;font-size:14px;color:#1C1C2E;font-weight:700;">${destino}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Hotel</td>
                  <td style="padding:6px 0;font-size:14px;color:#1C1C2E;font-weight:700;">${hotel}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Entrada</td>
                  <td style="padding:6px 0;font-size:14px;color:#1C1C2E;">${new Date(fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Salida</td>
                  <td style="padding:6px 0;font-size:14px;color:#1C1C2E;">${new Date(fechaFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Precio total</td>
                  <td style="padding:6px 0;font-size:18px;color:#E8445A;font-weight:700;">${precioTotal}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Pago flexible</td>
                  <td style="padding:6px 0;font-size:14px;color:#1C1C2E;">${pagoFlexible ? '✅ Sí, quiere pago fraccionado' : 'No'}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- EXTRAS -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:2px;">Extras seleccionados</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${extrasHTML}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 40px 40px;text-align:center;">
            <a href="${linkAdmin}"
              style="display:inline-block;background:#1C1C2E;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:16px 36px;border-radius:50px;letter-spacing:0.5px;">
              Ver en el panel de administración →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f8fc;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#1C1C2E;font-weight:600;">Inmagination Travel</p>
            <p style="margin:0;font-size:12px;color:#999;font-style:italic;">"Viajar es invertir en recuerdos"</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
