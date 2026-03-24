const mysql = require('mysql2/promise');
async function test() {
    try {
        await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
        console.log("Success");
    } catch (e) {
        console.error("ERROR_MSG:", e.message);
        console.error("ERROR_CODE:", e.code);
    }
}
test();
