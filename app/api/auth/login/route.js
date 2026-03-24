import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ message: 'Identifiants requis' }, { status: 400 });
        }

        const db = await getDb();
        const admin = await db.collection('admins').findOne({ username });

        if (!admin) {
            return NextResponse.json({ message: 'Identifiants incorrects' }, { status: 401 });
        }


        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Identifiants incorrects' }, { status: 401 });
        }

        // Créer la session (cookie JWT)
        await createSession(admin);

        return NextResponse.json({
            message: 'Connexion réussie',
            role: admin.role,
            restaurant_id: admin.restaurant_id
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    }
}
