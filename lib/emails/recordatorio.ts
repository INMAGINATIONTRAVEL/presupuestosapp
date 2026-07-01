export function emailRecordatorioHTML({
  nombre,
  destino,
  linkPresupuesto,
  fechaExpiracion,
}: {
  nombre: string
  destino: string
  linkPresupuesto: string
  fechaExpiracion?: string | null
}) {
  const expiracionText = fechaExpiracion
    ? `<p style="color:#E8445A;font-size:13px;margin-top:8px;font-weight:600;">⏰ Tu oferta expira el ${new Date(fechaExpiracion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recordatorio: tu propuesta te espera | Inmagination Travel</title>
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

        <!-- CUERPO -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">✨</div>
            <h2 style="margin:0 0 14px;font-size:26px;color:#1C1C2E;font-weight:700;">¡${nombre}, tu propuesta sigue esperándote!</h2>
            <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.7;">
              Hace unas horas te enviamos una propuesta de viaje especial a <strong>${destino}</strong>.<br/>
              ¡No te la pierdas! Accede ahora con tu email y descubre todos los detalles.
            </p>
            ${expiracionText}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 40px 40px;text-align:center;">
            <a href="${linkPresupuesto}"
              style="display:inline-block;background:#E8445A;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:18px 44px;border-radius:50px;letter-spacing:0.5px;">
              ✨ Ver mi propuesta ahora
            </a>
            <p style="margin-top:16px;font-size:12px;color:#bbb;">
              O copia este enlace:<br/>
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
