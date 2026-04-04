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
                        key={cat.id || cat._id.toString()}
                        className="category-card"
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
        </div>
    );
}
