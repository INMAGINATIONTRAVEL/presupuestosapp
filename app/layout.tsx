import type { Metadata } from 'next'
import { Playfair_Display, Poppins } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Inmagination Travel · Tu presupuesto mágico',
  description: 'Tu viaje a Disney Paris, personalizado para ti.',
  icons: {
    icon: '/favicon inmaginationtravel.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="min-h-full font-poppins antialiased bg-white">
        {children}
      </body>
    </html>
  )
}
