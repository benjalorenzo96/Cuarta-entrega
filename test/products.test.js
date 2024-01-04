import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js'; 

const { expect } = chai;
chai.use(chaiHttp);

describe('Products API', () => {
  it('should get a list of products', (done) => {
    chai
      .request(app)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status').eql('success');
        expect(res.body).to.have.property('payload').to.be.an('array');
        done();
      });
  });
  describe('Products API', () => {
    // Prueba para obtener detalles de un producto específico por su ID
    it('should get details of a specific product by ID', (done) => {
      chai
        .request(app)
        .get('/api/products/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status').eql('success');
          expect(res.body).to.have.property('payload').to.be.an('object');
          expect(res.body.payload).to.have.property('title');
          expect(res.body.payload).to.have.property('price');
          done();
        });
    });
  // Agrega más pruebas según sea necesario
})
})
