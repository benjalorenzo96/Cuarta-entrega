import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js'; 

const { expect } = chai;
chai.use(chaiHttp);

describe('Sessions API', () => {
  it('should log in a user', (done) => {
    // Simula una solicitud para iniciar sesión
    chai
      .request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' }) // Ajustar según estructura de datos
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('message').eql('Login successful');
        done();
      });
  });

  describe('Sessions API', () => {
    // Prueba para manejar errores al intentar iniciar sesión con credenciales incorrectas
    it('should handle errors when logging in with incorrect credentials', (done) => {
      chai
        .request(app)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'wrong_password' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('error');
          done();
        });
    });

// Prueba para cerrar sesión de un usuario
it('should log out a user', (done) => {
    chai
      .request(app)
      .get('/api/logout')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('message').eql('Logout successful');
        done();
      });
  });
  // Agrega más pruebas según sea necesario
})
});
