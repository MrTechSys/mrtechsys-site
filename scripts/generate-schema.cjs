const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, '../entities');
const outputFile = path.join(__dirname, '../schema.sql');

function mapType(jsonType) {
  if (jsonType === 'string') return 'TEXT';
  if (jsonType === 'number' || jsonType === 'integer') return 'INTEGER';
  if (jsonType === 'boolean') return 'BOOLEAN';
  if (jsonType === 'array' || jsonType === 'object') return 'TEXT'; // JSON string
  return 'TEXT';
}

function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function pluralize(str) {
    if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
    if (str.endsWith('s')) return str + 'es';
    return str + 's';
}

let sql = '\n-- Auto-generated Entities\n';

fs.readdirSync(entitiesDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  
  const content = fs.readFileSync(path.join(entitiesDir, file), 'utf8');
  try {
      const schema = JSON.parse(content);
      const tableName = pluralize(toSnakeCase(schema.name));
      
      let tableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      tableSql += `    id TEXT PRIMARY KEY,\n`;
      tableSql += `    created_at TEXT DEFAULT (datetime('now')),\n`;
      tableSql += `    updated_at TEXT DEFAULT (datetime('now'))`;

      if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, prop]) => {
              if (key === 'id' || key === 'created_at' || key === 'updated_at') return;
              tableSql += `,\n    ${key} ${mapType(prop.type)}`;
          });
      }
      
      tableSql += `\n);\n\n`;
      sql += tableSql;
  } catch (e) {
      console.error(`Error processing ${file}:`, e);
  }
});

fs.appendFileSync(outputFile, sql);
console.log('Schema appended to schema.sql');
