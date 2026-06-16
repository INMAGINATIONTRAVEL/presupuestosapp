import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM = process.env.EMAIL_FROM || 'Inmagination Travel <onboarding@resend.dev>'
export const EMAIL_AGENCIA = process.env.EMAIL_AGENCIA || ''
