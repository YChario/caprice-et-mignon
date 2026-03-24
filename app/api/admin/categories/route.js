// Force rebuild for Vercel Blob integration - 2026-03-24
import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import path from 'path';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const formData = await request.formData();
        const restoId = formData.get('restoId');
        const name = formData.get('name');
        const file = formData.get('image'); // Thumbnail image
        const menuFile = formData.get('menuFile'); // Menu PDF or Image

        // Sécurité
        if (session.role === 'resto_admin' && session.restaurant_id != restoId) {
            return NextResponse.json({ error: 'Non autorisé pour ce restaurant' }, { status: 403 });
        }

        if (!name || !restoId) {
            return NextResponse.json({ error: 'Nom et Restaurant requis' }, { status: 400 });
        }

        const handleUpload = async (uploadFile, folderPrefix) => {
            if (uploadFile && uploadFile.size > 0) {
                const filename = `categories/${folderPrefix}_${Date.now()}${path.extname(uploadFile.name)}`;
                const blob = await put(filename, uploadFile, {
                    access: 'public',
                });
                return blob.url;
            }
            return null;
        };

        const imageUrl = await handleUpload(file, 'cat');
        const menuFileUrl = await handleUpload(menuFile, 'menu');

        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const db = await getDb();
        // Get generic max id if needed, or just insert. 
        // For simplicity, we can use _id, but to maintain current logic we might need a counter.
        // Let's assume we can just insert and use _id later, but if code expects integer ID:
        const lastCat = await db.collection('categories').find().sort({ id: -1 }).limit(1).toArray();
        const nextId = lastCat.length > 0 ? (lastCat[0].id + 1) : 1;

        await db.collection('categories').insertOne({
            id: nextId,
            restaurant_id: parseInt(restoId),
            name,
            slug,
            image_url: imageUrl,
            menu_file_url: menuFileUrl,
            display_order: 0,
            is_active: 1,
            created_at: new Date()
        });

        // Revalidate to reflect new category
        revalidatePath('/', 'layout');

        return NextResponse.json({ success: true, message: 'Catégorie ajoutée' });

    } catch (error) {
        console.error('Erreur ajout catégorie:', error);
        return NextResponse.json({ error: 'Erreur interne: ' + (error.message || String(error)) }, { status: 500 });
    }
}
