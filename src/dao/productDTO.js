// dao/productDTO.js
class ProductDTO {
  constructor(id, title, price, thumbnail, category, availability, stock, club, league, season) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.thumbnail = thumbnail;
    this.category = category;
    this.availability = availability;
    this.stock = stock;
    this.club = club;
    this.league = league;
    this.season = season;
  }
}

export default ProductDTO;
