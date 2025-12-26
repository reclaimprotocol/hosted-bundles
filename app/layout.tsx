import './globals.css';

export const metadata = {
  title: 'Verification Portal - Reclaim Protocol',
  description: 'Verification powered by Reclaim Protocol',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
