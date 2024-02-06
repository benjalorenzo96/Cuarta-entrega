import ProductDTO from '../dao/productDTO.js';
import ProductDAO from '../dao/productDAO.js';
import { io } from '../app.js';

/**
 * @typedef ProductDTO
 * @property {string} _id - ID del producto.
 * @property {string} title - Título del producto.
 * @property {number} price - Precio del producto.
 * @property {string} category - Categoría del producto.
 * @property {boolean} availability - Disponibilidad del producto.
 * @property {number} stock - Cantidad disponible en stock.
 */

/**
 * @typedef ProductsResponse
 * @property {string} status - Estado de la respuesta.
 * @property {Array.<ProductDTO>} payload - Lista de productos.
 * @property {number} totalPages - Número total de páginas.
 * @property {number|null} prevPage - Página anterior.
 * @property {number|null} nextPage - Página siguiente.
 * @property {number} page - Página actual.
 * @property {boolean} hasPrevPage - Indica si hay una página anterior.
 * @property {boolean} hasNextPage - Indica si hay una página siguiente.
 * @property {string|null} prevLink - Enlace a la página anterior.
 * @property {string|null} nextLink - Enlace a la página siguiente.
 */

/**
 * Obtiene la lista de productos.
 * @route GET /api/products
 * @group Productos - Operaciones relacionadas con productos
 * @param {number} [limit=10] - Límite de productos por página.
 * @param {number} [page=1] - Número de página.
 * @param {string} [sort] - Orden de los resultados (asc/desc).
 * @param {string} [query] - Término de búsqueda.
 * @param {string} [category] - Categoría de productos.
 * @param {string} [availability] - Disponibilidad de productos (true/false).
 * @returns {ProductsResponse} 200 - Lista de productos.
 * @throws {500} - Error al obtener productos.
 * @description Obtiene la lista de productos disponibles.
 */

const productsController = {
  getProducts: async (req, res) => {
    // Extraer parámetros de la consulta
    const { limit = 10, page = 1, sort, query, category, availability } = req.query;
    const skip = (page - 1) * limit;
    const sortOptions = {};

    // Configurar opciones de ordenamiento si se proporciona 'asc' o 'desc'
    if (sort === 'asc' || sort === 'desc') {
      sortOptions.price = sort;
    }

    // Configurar filtros de consulta
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (availability === 'true' || availability === 'false') {
      filter.availability = availability === 'true';
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    try {
      // Obtener el número total de productos y calcular el número total de páginas
      const totalProducts = await ProductDAO.getProducts(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      // Obtener la lista de productos
      const products = await ProductDAO.getProducts(filter, skip, limit, sortOptions);

      // Formatear los productos para asegurar las propiedades requeridas
      const formattedProducts = products.map(product => ({
        id: product._id.toString(),
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        club: product.club,
        league: product.league,
        season: product.season,
      })).map(product => product.toObject());  // Agrega esta línea para convertir a objeto plano
      

      // Renderizar la vista de productos
      res.render('products', { user: req.session.user, products: formattedProducts, totalPages, page, limit, cartId: req.session.user.cartId });



    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },
  /**
   * Elimina un producto por su ID.
   * @route DELETE /api/products/{id}
   * @group Productos - Operaciones relacionadas con productos
   * @param {string} id.path.required - ID del producto a eliminar.
   * @returns {Object} 200 - Confirmación de eliminación.
   * @throws {403} - No tienes permisos para eliminar este producto.
   * @throws {500} - Error al eliminar el producto.
   * @description Elimina un producto por su ID.
   */
  deleteProduct: async (req, res) => {
    const productId = req.params.id;

    try {
      // Obtener el producto para verificar el propietario
      const product = await ProductDAO.getProductById(productId);

      // Verificar si el usuario actual es admin o el propietario del producto
      if (req.user.role === 'admin' || (req.user.role === 'premium' && product.owner === req.user.email)) {
        // Eliminar el producto
        await ProductDAO.deleteProduct(productId);

        res.json({ status: 'success', message: 'Producto eliminado correctamente' });
      } else {
        res.status(403).json({ error: 'No tienes permisos para eliminar este producto' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  },

  createProduct: async (req, res) => {
    try {
      // Extraer datos del cuerpo de la solicitud
      const { id, title, price, thumbnail, category, availability, stock, club, league, season } = req.body;

      // Crear un objeto ProductDTO
      const newProductDTO = new ProductDTO(id, title, price, thumbnail, category, availability, stock, club, league, season);

      // Utilizar el modelo para crear un nuevo documento en la colección de productos
      const createdProduct = await Product.create(newProductDTO);

      // Emitir un evento a través de WebSocket para informar sobre la adición del nuevo producto
      io.emit('productAdded', createdProduct);

      res.status(201).json({ status: 'success', payload: createdProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el producto' });
    }
  },
};

export { productsController };


