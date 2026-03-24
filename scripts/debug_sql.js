const fs = require('fs');
const sqlFile = fs.readFileSync('c:/Users/Shift/OneDrive/Bureau/caprice et mignon/caprice_mignon_db.sql', 'utf8');

const tableName = 'restaurants';
const regex = new RegExp(`INSERT INTO ${tableName} .*? VALUES ([\\s\\S]*?);`, 'g');
const matches = [...sqlFile.matchAll(regex)];

matches.forEach(match => {
    const valuesStr = match[1].trim();
    console.log('Values String Length:', valuesStr.length);
    console.log('Values String Start:', valuesStr.substring(0, 100));
    console.log('Values String End:', valuesStr.substring(valuesStr.length - 100));
    
    // Test multiple split strategies
    const split1 = valuesStr.split(/\),\s*\(/);
    console.log('Split 1 count:', split1.length);
    
    const split2 = valuesStr.split(/,(?=\s*\()/);
    console.log('Split 2 count:', split2.length);
    
    const split3 = valuesStr.split(/\r?\n/);
    console.log('Split 3 count:', split3.length);
});
