import { NextResponse } from 'next/server';
import { getSession } from '../../../../../../lib/auth';
import { getDb } from '../../../../../../lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const db = await getDb();
        const { categoryId } = await params;

        // Verify category belongs to user if resto admin
        if (session.role === 'resto_admin') {
            const category = await db.collection('categories').findOne({ id: parseInt(categoryId) });
            if (!category || category.restaurant_id !== session.restaurant_id) {
                return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
            }
            // Execute Delete
            await db.collection('categories').deleteOne({ id: parseInt(categoryId), restaurant_id: session.restaurant_id });
        } else {
            // Super admin can delete any
            await db.collection('categories').deleteOne({ id: parseInt(categoryId) });
        }

        // Revalidate all pages to be safe since it's hard to get the exact slug here 
        // without another DB query, but usually /admin would be the referer.
        revalidatePath('/', 'layout');

        // Redirect back to the dashboard. The URL is tricky to know exactly here, so we return a redirect header
        // Alternatively, since it's a form post, we can redirect to the referer
        const referer = request.headers.get('referer');
        return NextResponse.redirect(referer || new URL('/admin', request.url), 303);

    } catch (error) {
        console.error('Erreur suppression catégorie:', error);
        return NextResponse.json({ error: 'Erreur interne lors de la suppression' }, { status: 500 });
    }
}
