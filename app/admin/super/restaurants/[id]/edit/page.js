'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditRestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [isActive, setIsActive] = useState(true);

    // UI state
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch existing restaurant data
        fetch(`/api/admin/super/restaurants/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.restaurant) {
                    setName(data.restaurant.name);
                    setDescription(data.restaurant.description || '');
                    setIsActive(data.restaurant.is_active === 1);
                } else {
                    setError('Restaurant introuvable');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setInitialLoading(false));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('isActive', isActive ? '1' : '0');
            if (image) formData.append('image', image);

            const res = await fetch(`/api/admin/super/restaurants/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la modification');
            }

            // Redirect back to Super Admin dashboard
            router.push(`/admin/super`);
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
                    <Link href={`/admin/super`} style={{
                        padding: '0.5rem 1rem', background: '#373A40', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold'
                    }}>← Retour Super Admin</Link>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#4ade80' }}>Modifier le Restaurant</h1>
                </header>

                <section className="dashboard-content">
                    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '700px', margin: '0 auto', background: '#25262b', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                        {error && <div style={{ color: '#ff6b6b', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', borderRadius: '6px' }}>{error}</div>}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nom du Restaurant</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #4ade80', background: '#1a1b1e', color: 'white', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Petite Description (Page d'accueil)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #4ade80', background: '#1a1b1e', color: 'white', boxSizing: 'border-box' }}
                            ></textarea>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#eee', fontWeight: 'bold', cursor: 'pointer', padding: '0.5rem 0' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    style={{ width: '1.3rem', height: '1.3rem', accentColor: '#4ade80' }}
                                />
                                Restaurant Ouvert / Actif publiquement
                            </label>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eee', fontWeight: 'bold' }}>Nouvelle photo d'accueil (Upload la photo du resto) <br /><small style={{ color: '#aaa', fontWeight: 'normal' }}>Laissez vide si vous voulez conserver la photo actuelle.</small></label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                style={{ width: '100%', padding: '1rem', color: 'white', background: '#1a1b1e', borderRadius: '6px', border: '2px dashed #555', boxSizing: 'border-box', cursor: 'pointer' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#4ade80', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.3s'
                        }}>
                            {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications du Restaurant'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
