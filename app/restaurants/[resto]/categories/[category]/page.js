import Link from 'next/link';
import { getDb } from '../../../../../lib/db';
import './category.css';

export default async function CategoryPage({ params }) {
    const { resto, category } = await params;

    const db = await getDb();
    // 1. Fetch Restaurant to confirm it exists and get ID/Theme
    const restaurant = await db.collection('restaurants').findOne({ slug: resto });

    if (!restaurant) return <div className="not-found">Restaurant Inconnu</div>;

    // 2. Fetch Category details
    const cat = await db.collection('categories').findOne({ slug: category, restaurant_id: restaurant.id });

    if (!cat) return <div className="not-found">Catégorie Inconnue</div>;

    // 3. No products to fetch anymore, we use the category menu file

    const themeClass = restaurant.slug === 'caprice' ? 'theme-caprice' : 'theme-mignon';

    return (
        <div className={`category-container ${themeClass} animate-fade-in-up`}>
            {/* Décorations d'arrière-plan appétissantes */}
            <div className="bg-decorations">
                <div className="decor decor-1"></div>
                <div className="decor decor-2"></div>
                <div className="decor decor-3"></div>
            </div>

            <header className="cat-header">
                <Link href={`/restaurants/${restaurant.slug}`} className="back-btn">← Retour aux catégories</Link>
                <h1>{cat.name}</h1>
                <p>Découvrez notre sélection pour {cat.name.toLowerCase()}</p>
            </header>

            <main className="menu-viewer-container">
                {!cat.menu_file_url ? (
                    <div className="no-menu">Le menu pour cette catégorie n'est pas encore disponible.</div>
                ) : (
                    cat.menu_file_url.endsWith('.pdf') ? (
                        <iframe
                            src={cat.menu_file_url}
                            className="menu-frame"
                            title={`Menu ${cat.name}`}
                        ></iframe>
                    ) : (
                        <img
                            src={cat.menu_file_url}
                            className="menu-frame"
                            alt={`Menu ${cat.name}`}
                            style={{ objectFit: 'contain', background: 'transparent' }}
                        />
                    )
                )}
            </main>
        </div>
    );
}
