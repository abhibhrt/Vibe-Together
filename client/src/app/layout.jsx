import './globals.css';

export const metadata = {
  title: 'closemiles',
  description: 'closemiles – connect, collaborate and explore with seamless proximity-based interactions.',
  applicationName: 'closemiles',
  keywords: [
    'closemiles',
    'social app',
    'proximity app',
    'connect nearby',
    'location based app'
  ],
  authors: [{ name: 'closemiles' }],
  creator: 'closemiles',
  publisher: 'closemiles',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  },
  openGraph: {
    title: 'closemiles',
    description: 'closemiles – connect, collaborate and explore with seamless proximity-based interactions.',
    url: 'https://closemiles.com',
    siteName: 'closemiles',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'closemiles',
    description: 'closemiles – connect, collaborate and explore with seamless proximity-based interactions.',
    images: ['/logo.png']
  },
  manifest: '/manifest.json'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}