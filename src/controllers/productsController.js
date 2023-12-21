import ProductDTO from '../dao/productDTO.js'; // Importamos el DTO
import ProductDAO from '../dao/productDAO.js'; // Importamos el DAO

/**
 * Obtiene la lista de productos.
 * @route GET /api/products
 * @group Productos - Operaciones relacionadas con productos
 * @returns {Array.<ProductDTO>} 200 - Lista de productos.
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
      // Obtener el total de productos y calcular el número total de páginas
      const totalProducts = await ProductDAO.getTotalProducts(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      // Obtener productos paginados y aplicar el formato del DTO
      const products = await ProductDAO.getProducts(filter, skip, parseInt(limit), sortOptions);
      const productDTOs = products.map((product) =>
        new ProductDTO(
          product._id,
          product.title,
          product.price,
          product.category,
          product.availability,
          product.stock
        )
      );

      // Construir el objeto de respuesta paginada
      const result = {
        status: 'success',
        payload: productDTOs,
        totalPages: totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page: page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
        nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}` : null,
      };

      // Enviar la respuesta JSON
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

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
  // Puedes agregar otras funciones relacionadas con productos aquí si es necesario
};

export { productsController };


