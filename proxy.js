import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = 'super-secret-key-pour-caprice-et-mignon';
const key = new TextEncoder().encode(secretKey);

export async function proxy(request) {
    const path = request.nextUrl.pathname;

    // Si on essaie d'accéder à l'admin (sauf login)
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const sessionCookie = request.cookies.get('admin_session');

        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Vérifier le token
            const { payload } = await jwtVerify(sessionCookie.value, key, {
                algorithms: ['HS256'],
            });

            // Contrôle d'accès basé sur le rôle
            if (path.startsWith('/admin/super') && payload.role !== 'super_admin') {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }

            if (path.startsWith('/admin/resto')) {
                // Un super_admin a accès à tout
                if (payload.role !== 'super_admin') {
                    // Extraire l'ID du restaurant depuis l'URL (ex: /admin/resto/1)
                    const match = path.match(/^\/admin\/resto\/(\d+)/);
                    const urlRestoId = match ? parseInt(match[1]) : null;

                    if (urlRestoId && payload.restaurant_id !== urlRestoId) {
                        // Blocage si le resto_admin essaie de voir le resto d'un autre
                        return NextResponse.redirect(new URL(`/admin/resto/${payload.restaurant_id}`, request.url));
                    }
                }
            }

            return NextResponse.next();
        } catch (error) {
            // Token invalide ou expiré
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
