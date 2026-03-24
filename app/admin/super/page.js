import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession, logout } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import './super.css';
import DeleteRestaurantForm from './DeleteRestaurantForm';

export default async function SuperDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'super_admin') {
        redirect('/admin/login');
    }

    const db = await getDb();
    // Fetch tous les restaurants
    const restaurants = await db.collection('restaurants').find({}).sort({ id: 1 }).toArray();

    return (
        <div className="admin-container">
            <nav className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Super Admin</h2>
                    <p>Bonjour, {session.username}</p>
                </div>
                <ul className="sidebar-menu">
                    <li className="active">Restaurants</li>
                    <li>Administrateurs</li>
                    <li>Paramètres globaux</li>
                </ul>
                <form action="/api/auth/logout" method="POST" className="logout-form">
                    <button type="submit" className="logout-btn">Se déconnecter</button>
                </form>
            </nav>

            <main className="admin-main">
                <header className="main-header">
                    <h1>Gestion des Restaurants</h1>
                    <button className="btn-primary">+ Nouveau Restaurant</button>
                </header>

                <section className="dashboard-content">
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Slug</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map((resto) => (
                                    <tr key={resto.id || resto._id.toString()}>
                                        <td>{resto.id}</td>
                                        <td><strong>{resto.name}</strong></td>
                                        <td>{resto.slug}</td>
                                        <td>
                                            <span className={`status-badge ${resto.is_active ? 'active' : 'inactive'}`}>
                                                {resto.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={`/admin/resto/${resto.id}`} className="btn-action view" title="Gérer le menu">Gérer Menu</a>
                                                <Link href={`/admin/super/restaurants/${resto.id}/edit`} className="btn-action edit" style={{ textDecoration: 'none' }}>Modifier</Link>

                                                <DeleteRestaurantForm restoId={resto.id} restoName={resto.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {restaurants.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">Aucun restaurant trouvé</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
