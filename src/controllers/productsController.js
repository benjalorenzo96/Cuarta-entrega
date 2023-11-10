// controllers/productsController.js
import ProductDTO from '../dao/productDTO.js'; // Importamos el DTO
import ProductDAO from '../dao/productDAO.js'; // Importamos el DAO

const productsController = {
  getProducts: async (req, res) => {
    const { limit = 10, page = 1, sort, query, category, availability } = req.query;
    const skip = (page - 1) * limit;
    const sortOptions = {};

    if (sort === 'asc' || sort === 'desc') {
      sortOptions.price = sort;
    }

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
      const totalProducts = await ProductDAO.getTotalProducts(filter);
      const totalPages = Math.ceil(totalProducts / limit);
      const products = await ProductDAO.getProducts(filter, skip, parseInt(limit), sortOptions);

      // Utilizamos el DTO aquí para formatear los productos
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

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  // Puedes agregar otras funciones relacionadas con productos aquí si es necesario
};

export { productsController };

