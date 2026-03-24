import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = 'super-secret-key-pour-caprice-et-mignon';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(admin) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    const sessionData = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        restaurant_id: admin.restaurant_id
    };

    const token = await encrypt(sessionData);

    // set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
}
