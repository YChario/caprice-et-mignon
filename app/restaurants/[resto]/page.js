import Link from 'next/link';
import { getDb } from '../../../lib/db';
import './restaurant.css';

export default async function RestaurantPage({ params }) {
    const { resto } = await params;

    const db = await getDb();
    // Fetch Restaurant details
    const restaurant = await db.collection('restaurants').findOne({ slug: resto });

    if (!restaurant) {
        return <div className="not-found">Restaurant Inconnu</div>;
    }

    // Fetch Categories for this restaurant
    const rawCategories = await db.collection('categories').find({ restaurant_id: restaurant.id }).toArray();

    // Group Crepe and Croffles into a single visual card
    const categories = [];
    const mergedGroup = [];

    rawCategories.forEach(cat => {
        const nameLower = cat.name.toLowerCase();
        if (nameLower.includes('crepe') || nameLower.includes('crêpe') || nameLower.includes('croffle')) {
            mergedGroup.push(cat);
        } else {
            categories.push(cat);
        }
    });

    if (mergedGroup.length > 0) {
        // Create a combined category button using the primary's data for the link/image
        const combined = {
            ...mergedGroup[0], // Prefer the first one found (e.g. Crepes)
            name: "Crêpes & Croffles"
        };
        categories.unshift(combined);
    }

    const themeClass = restaurant.slug === 'caprice' ? 'theme-caprice' : 'theme-mignon';

    return (
        <div className={`restaurant-container ${themeClass} animate-fade-in-up`}>
            <header className="resto-header">
                <Link href="/" className="back-btn">← Retour</Link>
                <h1>{restaurant.name}</h1>
                <p>{restaurant.description}</p>
            </header>

            <main className="categories-grid">
                {categories.map((cat) => (
                    <Link
                        href={`/restaurants/${restaurant.slug}/categories/${cat.slug}`}
                        key={cat.id || (cat._id && cat._id.toString())}
                        className={`category-card ${cat.name === 'Crêpes & Croffles' ? 'full-width' : ''}`}
                    >
                        <div className="cat-image-wrapper">
                            {cat.image_url ? (
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="cat-image"
                                />
                            ) : (
                                <div className="cat-image-placeholder">
                                    <span className="cat-initial">{cat.name.charAt(0)}</span>
                                </div>
                            )}
                            <div className="cat-info">
                                <div className="cat-info-text">
                                    <h3>{cat.name}</h3>
                                    <p className="resto-name-overlay">{restaurant.name}</p>
                                </div>
                                <span className="view-btn">Voir →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </main>

            {restaurant.slug === 'caprice' && (
                <footer className="resto-footer">
                    <div className="social-links-container">
                        <a 
                            href="https://www.tiktok.com/@capricemtl?_r=1&_t=ZS-95IMDJAl9zL" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-link tiktok-link"
                        >
                            <div className="social-icon-wrapper tiktok-icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="social-svg">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                            </div>
                            <span className="social-text">TikTok</span>
                        </a>
                        
                        <a 
                            href="https://www.instagram.com/caprice.croffle.crepe?igsh=MXV6Nnc1anhjODg4cw%3D%3D&utm_source=qr" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-link instagram-link"
                        >
                            <div className="social-icon-wrapper instagram-icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="social-svg">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <span className="social-text">Instagram</span>
                        </a>
                    </div>
                </footer>
            )}
        </div>
    );
}
