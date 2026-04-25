import './globals.css'

export const metadata = {
  title: 'Sınav Platformu',
  description: 'AI Destekli Yapay Zeka Sınav Platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
