import { NextResponse } from 'next/server';
import { getSession } from '../../../../../../lib/auth';
import { getDb } from '../../../../../../lib/db';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// Get a single restaurant for editing
export async function GET(request, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const { id } = await params;
        const db = await getDb();
        const restaurant = await db.collection('restaurants').findOne({ id: parseInt(id) });

        if (!restaurant) return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });

        return NextResponse.json({ restaurant });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Edit a restaurant (Name, Slug, Description, Image)
export async function PUT(request, { params }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get('name');
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : null;
        const description = formData.get('description');
        const isActiveStr = formData.get('isActive');
        const isActive = isActiveStr === '1' ? 1 : 0;
        const file = formData.get('image');

        if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

        const db = await getDb();
        const existing = await db.collection('restaurants').findOne({ id: parseInt(id) });
        if (!existing) return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });

        let imageUrl = existing.image_url;

        // Upload New Image if provided
        if (file && file.size > 0 && typeof file.name === 'string') {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = path.extname(file.name);
            const filename = `resto_${slug}_${Date.now()}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public/uploads/restaurants');

            // Ensure folder exists (simplification: assume it does or created manually, or let fs handle if it fails we log)
            try {
                const filepath = path.join(uploadDir, filename);
                await writeFile(filepath, buffer);
                imageUrl = `/uploads/restaurants/${filename}`;

                // Optional: Delete old image to save space
                if (existing.image_url && !existing.image_url.startsWith('http')) {
                    const oldPath = path.join(process.cwd(), 'public', existing.image_url);
                    await unlink(oldPath).catch(() => { });
                }
            } catch (fsErr) {
                console.error("Error saving file", fsErr);
            }
        }

        await db.collection('restaurants').updateOne(
            { id: parseInt(id) },
            {
                $set: {
                    name,
                    slug,
                    description,
                    image_url: imageUrl,
                    is_active: isActive
                }
            }
        );
        
        // Revalidate the home page to reflect changes (name, slug, image, active status)
        revalidatePath('/');

        return NextResponse.json({ success: true, message: 'Restaurant mis à jour' });

    } catch (error) {
        console.error('Erreur modif restaurant:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
