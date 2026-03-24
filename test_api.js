fetch('http://localhost:3000/api/admin/categories', {
    method: 'POST',
    body: (function () {
        const bd = new URLSearchParams();
        bd.append('restoId', '1');
        bd.append('name', 'Test Category Fetch');
        return bd;
    })()
}).then(res => res.json()).then(console.log).catch(console.error);
