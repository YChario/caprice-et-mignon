import { NextResponse } from 'next/server';
import { logout } from '../../../../lib/auth';

export async function POST(request) {
    try {
        await logout();
        // Redirect to login page after logout
        return NextResponse.redirect(new URL('/admin/login', request.url));
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Erreur lors de la déconnexion' }, { status: 500 });
    }
}
