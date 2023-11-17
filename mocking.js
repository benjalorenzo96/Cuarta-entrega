// mocking.js
const generateMockProducts = (quantity = 100) => {
    const mockProducts = [];
    for (let i = 1; i <= quantity; i++) {
      mockProducts.push({
        _id: i.toString(),
        name: `Product ${i}`,
        price: Math.floor(Math.random() * 100) + 1, // Precio aleatorio entre 1 y 100
        // Agrega más propiedades según sea necesario
      });
    }
    return mockProducts;
  };
  
  export { generateMockProducts };
  