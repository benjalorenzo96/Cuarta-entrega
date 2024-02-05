// paymentsRouter.js
import express from 'express';
import PaymentService from '../services/paymentService.js';

const router = express.Router();
const paymentService = new PaymentService();

router.post('/payment-intents', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await paymentService.createPaymentIntent(amount, currency);
    res.status(200).json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el intento de pago' });
  }
});

export default router;
