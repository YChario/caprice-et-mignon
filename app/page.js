import Link from 'next/link';
import { getDb } from '../lib/db';
import './page.css';

export default async function Home() {
    const db = await getDb();
    const restaurants = await db.collection('restaurants').find({}).toArray();

    return (
        <div className="landing-container animate-fade-in-up">
            <div className="branding">
                <h1>Bienvenue</h1>
                <p>Veuillez sélectionner votre restaurant pour découvrir notre menu.</p>
            </div>

            <div className="restaurant-options">
                {restaurants.map((resto) => (
                    <Link
                        href={`/restaurants/${resto.slug}`}
                        key={resto.id}
                        className={`resto-card ${resto.slug}`}
                        style={{
                            /* Use a CSS variable to pass the dynamic url to the ::before pseudo-element */
                            '--bg-image': resto.image_url ? `url('${resto.image_url}')` : 'none'
                        }}
                    >
                        <div className="card-content">
                            <h2>{resto.name}</h2>
                            <p>{resto.description}</p>
                        </div>
                        <div className="card-overlay"></div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
