import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

const mongoUri = 'mongodb://localhost:27017'; // Asegúrate de ajustar la URI de MongoDB según tu configuración
const dbName = 'Coderhouse';
const collectionName = 'products';

// Lee el archivo Productos.json
const productsData = JSON.parse(readFileSync('Productos.json', 'utf8'));

// Función principal para agregar productos a la base de datos
async function importProducts() {
  const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Elimina los documentos existentes en la colección antes de insertar los nuevos productos
    await collection.deleteMany({});

    // Inserta los productos en la colección
    const result = await collection.insertMany(productsData);
    console.log(`${result.insertedCount} productos agregados a la base de datos`);

  } finally {
    await client.close();
    console.log('Conexión cerrada');
  }
}

// Ejecuta la función principal
importProducts();

