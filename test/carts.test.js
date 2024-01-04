import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';

const { expect } = chai;
chai.use(chaiHttp);

describe('Carts API', () => {
  it('should add a product to the cart', (done) => {
    // Simula una solicitud para agregar un producto al carrito
    chai
      .request(app)
      .post('/api/carts/:pid/add')
      .send({ productId: '1', quantity: 2 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('message').eql('Product added to cart successfully');
        done();
      });
  });
  describe('Carts API', () => {
    // Prueba para obtener el contenido completo del carrito de un usuario
    it('should get the complete content of the user\'s cart', (done) => {
      chai
        .request(app)
        .get('/api/carts/:userId') 
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status').eql('success');
          expect(res.body).to.have.property('payload').to.be.an('array');
          done();
        });
    });
  // Agrega más pruebas según sea necesario
})
});
