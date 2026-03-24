'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const { restoId, categoryId } = params;

    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [menuFile, setMenuFile] = useState(null);
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch existing category data
        fetch(`/api/admin/categories/${categoryId}`)
            .then(res => res.json())
            .then(data => {
                if (data.category) {
                    setName(data.category.name);
                    setIsActive(data.category.is_active === 1);
                } else {
                    setError('Catégorie introuvable');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setInitialLoading(false));
    }, [categoryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('restoId', restoId);
            formData.append('name', name);
            formData.append('isActive', isActive ? '1' : '0');
            if (image) formData.append('image', image);
            if (menuFile) formData.append('menuFile', menuFile);

            const res = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la modification');
            }

            // Redirect back to dashboard
            router.push(`/admin/resto/${restoId}`);
            router.refresh();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div style={{ padding: '2rem', color: 'white' }}>Chargement...</div>;

    return (
        <div className="admin-container" style={{ minHeight: '100vh', background: '#1a1b1e', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <main className="admin-main" style={{ marginLeft: 0, padding: '2rem' }}>
                <header className="main-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <Link href={`/admin/resto/${restoId}`} style={{
                        padding: '0.5rem 1rem', background: '#373A40', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold'
                    }}>← Retour</Link>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#4ade80' }}>Modifier la Catégorie</h1>
                </header>
                <section className="dashboard-content">
                    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '600px', margin: '0 auto', background: '#25262b', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', borderRadius: '4px' }}>{error}</div>}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nom de la catégorie</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #4ade80', background: '#1a1b1e', color: 'white', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#eee', fontWeight: 'bold', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    style={{ width: '1.2rem', height: '1.2rem', accentColor: '#4ade80' }}
                                />
                                Catégorie visible sur le menu
                            </label>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nouvelle Image de couverture (Laisser vide pour conserver l'actuelle)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                style={{ width: '100%', padding: '0.5rem', color: 'white', background: '#1a1b1e', borderRadius: '4px', border: '1px dashed #555', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nouveau Fichier Menu (PDF/Image) (Laisser vide pour conserver l'actuel)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setMenuFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.5rem', color: 'white', background: '#1a1b1e', borderRadius: '4px', border: '1px dashed #555', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#f59f00', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
