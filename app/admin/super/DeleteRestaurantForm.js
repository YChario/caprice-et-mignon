'use client';

export default function DeleteRestaurantForm({ restoId, restoName }) {
    return (
        <form action={`/api/admin/super/restaurants/${restoId}/delete`} method="POST" onSubmit={(e) => {
            if (!window.confirm(`Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT le restaurant "${restoName}" et TOUTES ses catégories ?`)) e.preventDefault();
        }}>
            <button type="submit" className="btn-action delete" style={{ background: '#ff4757', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Supprimer</button>
        </form>
    );
}
