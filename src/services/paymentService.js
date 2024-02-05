// paymentService.js
import stripe from 'stripe';
import { config } from '../../config.js';

const stripeInstance = stripe(config.stripeSecretKey);

class PaymentService {
  async createPaymentIntent(amount, currency) {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount,
        currency,
      });
      return { client_secret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error al crear el intento de pago:', error);
      throw error;
    }
  }
}

export default PaymentService;


