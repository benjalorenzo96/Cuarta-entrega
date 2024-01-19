import mongoose from 'mongoose';
import config from './config.js';
import Product from './src/dao/models/productModel.js';

mongoose.connect(config.databaseConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Coderhouse',  // Agrega esta línea para especificar la base de datos
  });
  
  const db = mongoose.connection;
  
  db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
  db.once('open', async () => {
    console.log('Conexión a MongoDB exitosa.');

  // Agregar productos (camisetas de fútbol)
  const footballShirts = [
    {
      title: 'Camiseta Local Barcelona',
      description: 'Camiseta de local del FC Barcelona',
      price: 20.000,
      thumbnail: 'url_de_la_imagen',
      code: 'BAR-001',
      stock: 50,
      club: 'FC Barcelona',
      league: 'La Liga',
      season: '2022-2023',
    },
    {
      title: 'Camiseta Visitante Real Madrid',
      description: 'Camiseta de visitante del Real Madrid',
      price: 25.000,
      thumbnail: 'url_de_la_imagen',
      code: 'RMD-001',
      stock: 40,
      club: 'Real Madrid',
      league: 'La Liga',
      season: '2022-2023',
    },
    {
      title: 'Camiseta Local Manchester United',
      description: 'Camiseta de local del Manchester United',
      price: 22.000,
      thumbnail: 'url_de_la_imagen',
      code: 'MNU-001',
      stock: 60,
      club: 'Manchester United',
      league: 'Premier League',
      season: '2022-2023',
    },
    {
        title: 'Camiseta Local Racing Club',
        description: 'Camiseta de local de Racing Club',
        price: 20.000,
        thumbnail: 'url_de_la_imagen',
        code: 'RAC-001',
        stock: 60,
        club: 'Racing Club',
        league: 'Liga Argentina',
        season: '2022-2023',
      },
      {
        title: 'Camiseta Local Banfield',
        description: 'Camiseta de local de Banfield',
        price: 17.000,
        thumbnail: 'url_de_la_imagen',
        code: 'BAN-001',
        stock: 60,
        club: 'Banfield',
        league: 'Liga Argentina',
        season: '2022-2023',
      },
      {
        title: 'Camiseta Local Manchester City',
        description: 'Camiseta de local del Manchester City',
        price: 23.000,
        thumbnail: 'url_de_la_imagen',
        code: 'MCI-001',
        stock: 60,
        club: 'Manchester City',
        league: 'Premier League',
        season: '2022-2023',
      },
      {
        title: 'Camiseta Local Inter',
        description: 'Camiseta de local del Inter',
        price: 24.000,
        thumbnail: 'url_de_la_imagen',
        code: 'INT-001',
        stock: 60,
        club: 'Inter',
        league: 'Serie A',
        season: '2022-2023',
      },

  ];

  try {
    await Product.insertMany(footballShirts);
    console.log('Productos agregados exitosamente.');
  } catch (error) {
    console.error('Error al agregar productos:', error);
  } finally {
    mongoose.disconnect();
  }
});

