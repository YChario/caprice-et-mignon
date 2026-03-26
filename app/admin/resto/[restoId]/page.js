import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import '../../super/super.css'; // On réutilise les styles globaux admin
import './resto_admin.css';

export default async function RestoAdminDashboard({ params }) {
    const session = await getSession();
    const { restoId } = await params;

    if (!session) redirect('/admin/login');

    const db = await getDb();
    // Au niveau du proxy, la sécurité est déjà assurée (un resto_admin ne peut pas voir un autre resto)
    // On récupère le restaurant
    const restaurant = await db.collection('restaurants').findOne({ id: parseInt(restoId) });

    if (!restaurant) {
        return <div className="p-10 text-center">Restaurant introuvable</div>;
    }

    // On récupère les catégories
    const categories = await db.collection('categories').find({ restaurant_id: restaurant.id }).sort({ display_order: 1 }).toArray();

    // Plus de produits à récupérer !

    return (
        <div className="admin-container">
            <nav className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>{restaurant.name}</h2>
                    <p>Admin: {session.username}</p>
                </div>
                <ul className="sidebar-menu">
                    {session.role === 'super_admin' && (
                        <li><a href="/admin/super">← Retour Super Admin</a></li>
                    )}
                    <li className="active">Menu & Catégories</li>
                    <li>Paramètres du Restaurant</li>
                </ul>
                <form action="/api/auth/logout" method="POST" className="logout-form">
                    <button type="submit" className="logout-btn">Se déconnecter</button>
                </form>
            </nav>

            <main className="admin-main">
                <header className="main-header">
                    <h1>Gestion du Menu - {restaurant.name}</h1>
                    <div className="header-actions">
                        <Link href={`/admin/resto/${restaurant.id}/categories/new`} className="btn-secondary">+ Catégorie</Link>
                    </div>
                </header>

                <section className="dashboard-content two-columns">
                    {/* Colonne Catégories */}
                    <div className="table-wrapper half-width">
                        <h3 className="section-title">Catégories</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Menu</th>
                                    <th>Visibilité</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id || cat._id.toString()}>
                                        <td>{cat.name}</td>
                                        <td>
                                            <span style={{ fontSize: '0.9rem', color: cat.menu_file_url ? '#4ade80' : '#ff6b6b' }}>
                                                {cat.menu_file_url ? '✓ Uploadé' : '✗ Manquant'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${cat.is_active ? 'active' : 'inactive'}`}>
                                                {cat.is_active ? 'Visible' : 'Caché'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link href={`/admin/resto/${restaurant.id}/categories/${cat.id}/edit`} className="btn-action edit">Éditer</Link>
                                            <form action={`/api/admin/categories/${cat.id}/delete`} method="POST" style={{ display: 'inline' }}>
                                                <button type="submit" className="btn-action" style={{ background: '#ff4757', color: 'white' }}>Supprimer</button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan="4" className="text-center">Aucune catégorie</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
