import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const { categoryId } = await params;
        const db = await getDb();
        const category = await db.collection('categories').findOne({ id: parseInt(categoryId) });

        if (!category) return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });

        return NextResponse.json({ category });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const { categoryId } = await params;
        const formData = await request.formData();
        const restoId = formData.get('restoId');
        const name = formData.get('name');
        const isActiveStr = formData.get('isActive');
        const isActive = isActiveStr === '1' ? 1 : 0;
        const file = formData.get('image');
        const menuFile = formData.get('menuFile');

        if (session.role === 'resto_admin' && session.restaurant_id != restoId) {
            return NextResponse.json({ error: 'Non autorisé pour ce restaurant' }, { status: 403 });
        }

        if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

        const db = await getDb();
        // Get existing to keep old URLs if not replaced
        const existing = await db.collection('categories').findOne({ id: parseInt(categoryId) });
        if (!existing) return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });

        let imageUrl = existing.image_url;
        let menuFileUrl = existing.menu_file_url;

        const handleUpload = async (uploadFile, folderPrefix) => {
            if (uploadFile && uploadFile.size > 0 && typeof uploadFile.name === 'string') {
                const bytes = await uploadFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const ext = path.extname(uploadFile.name);
                const filename = `${folderPrefix}_${Date.now()}${ext}`;
                const uploadDir = path.join(process.cwd(), 'public/uploads/categories');
                const filepath = path.join(uploadDir, filename);
                await writeFile(filepath, buffer);
                return `/uploads/categories/${filename}`;
            }
            return null; // Signals no new file
        };

        const newImageUrl = await handleUpload(file, 'cat');
        if (newImageUrl) imageUrl = newImageUrl;

        const newMenuFileUrl = await handleUpload(menuFile, 'menu');
        if (newMenuFileUrl) menuFileUrl = newMenuFileUrl;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        await db.collection('categories').updateOne(
            { id: parseInt(categoryId) },
            {
                $set: {
                    name,
                    slug,
                    image_url: imageUrl,
                    menu_file_url: menuFileUrl,
                    is_active: isActive
                }
            }
        );

        return NextResponse.json({ success: true, message: 'Catégorie mise à jour' });

    } catch (error) {
        console.error('Erreur modif catégorie:', error);
        return NextResponse.json({ error: 'Erreur interne: ' + error.message }, { status: 500 });
    }
}
