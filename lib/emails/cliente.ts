export function emailClienteHTML({
  nombre,
  destino,
  hotel,
  fechaInicio,
  fechaFin,
  noches,
  linkPresupuesto,
  fechaExpiracion,
}: {
  nombre: string
  destino: string
  hotel: string
  fechaInicio: string
  fechaFin: string
  noches: number
  linkPresupuesto: string
  fechaExpiracion?: string | null
}) {
  const expiracionText = fechaExpiracion
    ? `<p style="color:#E8445A;font-size:13px;margin-top:12px;font-weight:600;">⏰ Oferta disponible hasta el ${new Date(fechaExpiracion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tu propuesta de viaje | Inmagination Travel</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#ffffff;border-bottom:4px solid #E8445A;padding:36px 40px 28px;text-align:center;">
            <p style="margin:0 0 6px;color:#E8445A;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Tu agencia de confianza</p>
            <h1 style="margin:0;color:#1C1C2E;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Inmagination Travel</h1>
            <p style="margin:8px 0 0;color:#999;font-size:13px;font-style:italic;">"Viajar es invertir en recuerdos"</p>
          </td>
        </tr>

        <!-- SALUDO -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:2px;">Tu propuesta exclusiva</p>
            <h2 style="margin:0 0 14px;font-size:30px;color:#1C1C2E;font-weight:700;">Hola, ${nombre} ✨</h2>
            <p style="margin:0;font-size:15px;color:#555;line-height:1.7;">
              Hemos preparado una propuesta de viaje especial para ti.<br/>
              Accede con tu email y descubre todos los detalles de tu viaje soñado.
            </p>
          </td>
        </tr>

        <!-- TARJETA VIAJE -->
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:#f8f8fc;border-radius:12px;padding:24px;border-left:4px solid #E8445A;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#E8445A;text-transform:uppercase;letter-spacing:2px;">Resumen del viaje</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;font-size:14px;color:#888;width:40%;border-bottom:1px solid #eee;">✈️ Destino</td>
                  <td style="padding:7px 0;font-size:14px;color:#1C1C2E;font-weight:700;border-bottom:1px solid #eee;">${destino}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:14px;color:#888;border-bottom:1px solid #eee;">🏰 Hotel</td>
                  <td style="padding:7px 0;font-size:14px;color:#1C1C2E;font-weight:700;border-bottom:1px solid #eee;">${hotel}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:14px;color:#888;border-bottom:1px solid #eee;">📅 Entrada</td>
                  <td style="padding:7px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #eee;">${new Date(fechaInicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:14px;color:#888;border-bottom:1px solid #eee;">📅 Salida</td>
                  <td style="padding:7px 0;font-size:14px;color:#1C1C2E;border-bottom:1px solid #eee;">${new Date(fechaFin).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:14px;color:#888;">🌙 Duración</td>
                  <td style="padding:7px 0;font-size:14px;color:#1C1C2E;font-weight:600;">${noches + 1} días / ${noches} noches</td>
                </tr>
              </table>
              <div style="border-top:1px solid #e0e0e0;margin-top:16px;padding-top:16px;text-align:center;">
                <p style="margin:0;font-size:13px;color:#888;">Accede a tu propuesta para ver el precio y todos los extras disponibles.</p>
              </div>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 40px;text-align:center;">
            ${expiracionText}
            <div style="margin-top:20px;">
              <a href="${linkPresupuesto}"
                style="display:inline-block;background:#E8445A;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:18px 44px;border-radius:50px;letter-spacing:0.5px;">
                ✨ Ver mi propuesta completa
              </a>
            </div>
            <p style="margin-top:16px;font-size:12px;color:#bbb;">
              O copia este enlace en tu navegador:<br/>
              <span style="color:#E8445A;word-break:break-all;">${linkPresupuesto}</span>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f8fc;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#1C1C2E;font-weight:700;">Inmagination Travel</p>
            <p style="margin:0 0 8px;font-size:12px;color:#999;">Especialistas en Disneyland Paris</p>
            <p style="margin:0;font-size:11px;color:#ccc;">Si no esperabas este correo, puedes ignorarlo.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
