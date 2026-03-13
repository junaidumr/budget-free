const db = require('./db');

const checkTables = async () => {
    try {
        const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables in database:', res.rows.map(r => r.table_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
};

checkTables();
