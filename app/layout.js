import './globals.css'

export const metadata = {
    title: 'Caprice',
    description: 'Découvrez nos menus',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body>
                <main>{children}</main>
            </body>
        </html>
    )
}
