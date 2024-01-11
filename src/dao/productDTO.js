// dao/productDTO.js
class ProductDTO {
    constructor(id, title, price, category, availability, stock) {
      this.id = id;
      this.title = title;
      this.price = price;
      this.category = category;
      this.availability = availability;
      this.stock = stock;
      this.club = club;
      this.league = league;
      this.season = season;
    }
  }
  
  export default ProductDTO;
  