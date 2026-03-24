import { NextResponse } from 'next/server';
import { getSession } from '../../../../../../../lib/auth';
import { getDb } from '../../../../../../../lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'super_admin') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const db = await getDb();
        const { id } = await params;

        // Cascade delete categories first
        await db.collection('categories').deleteMany({ restaurant_id: parseInt(id) });

        // Then delete the restaurant
        await db.collection('restaurants').deleteOne({ id: parseInt(id) });

        // Revalidate the home page to remove the restaurant from the list
        revalidatePath('/');

        const referer = request.headers.get('referer');
        return NextResponse.redirect(referer || new URL('/admin/super', request.url), 303);

    } catch (error) {
        console.error('Erreur suppression restaurant:', error);
        return NextResponse.json({ error: 'Erreur interne lors de la suppression' }, { status: 500 });
    }
}
