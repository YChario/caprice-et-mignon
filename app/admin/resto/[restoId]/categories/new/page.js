'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AddCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [menuFile, setMenuFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('restoId', params.restoId);
            formData.append('name', name);
            if (image) formData.append('image', image);
            if (menuFile) formData.append('menuFile', menuFile);

            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la création');
            }

            // Redirect back to dashboard
            router.push(`/admin/resto/${params.restoId}`);
            router.refresh();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container" style={{ minHeight: '100vh', background: '#1a1b1e', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <main className="admin-main" style={{ marginLeft: 0, padding: '2rem' }}>
                <header className="main-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <Link href={`/admin/resto/${params.restoId}`} style={{
                        padding: '0.5rem 1rem', background: '#373A40', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold'
                    }}>← Retour</Link>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#4ade80' }}>Ajouter une Catégorie</h1>
                </header>
                <section className="dashboard-content">
                    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '600px', margin: '0 auto', background: '#25262b', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', borderRadius: '4px' }}>{error}</div>}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nom de la catégorie (ex: Menus, Plats, Boissons)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #4ade80', background: '#1a1b1e', color: 'white', boxSizing: 'border-box' }}
                                placeholder="Entrez le nom ici..."
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Image de la catégorie (Optionnelle mais recommandée)</label>
                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.4' }}>Vous pouvez uploader une photo de votre menu pour illustrer cette catégorie. Les clients verront cette image en cliquant sur la catégorie.</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                style={{ width: '100%', padding: '0.5rem', color: 'white', background: '#1a1b1e', borderRadius: '4px', border: '1px dashed #555', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Menu de la catégorie (PDF ou Image)</label>
                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.4' }}>Uploadez ici la page du menu (Plats, Boissons, etc.) en PDF ou en Image. Cette image sera affichée quand le client cliquera sur la catégorie.</p>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setMenuFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.5rem', color: 'white', background: '#1a1b1e', borderRadius: '4px', border: '1px dashed #555', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Création en cours...' : 'Ajouter la Catégorie'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
