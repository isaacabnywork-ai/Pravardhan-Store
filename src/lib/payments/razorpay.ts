import crypto from 'crypto';

interface CreatePaymentOptions {
  orderId: string;
  amount: number; // in INR rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export class PaymentService {
  private static keyId = process.env.RAZORPAY_KEY_ID || '';
  private static keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  private static webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  /**
   * Creates a payment order through Razorpay API or simulated secure mock in dev
   */
  static async createOrder(options: CreatePaymentOptions) {
    if (this.keyId && this.keySecret) {
      // Live Razorpay call
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(options.amount * 100), // convert to paise
          currency: options.currency || 'INR',
          receipt: options.receipt,
          notes: options.notes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      return await res.json();
    }

    // High fidelity dev simulation
    return {
      id: `order_mock_${Date.now()}`,
      entity: 'order',
      amount: Math.round(options.amount * 100),
      currency: options.currency || 'INR',
      receipt: options.receipt,
      status: 'created',
      mock: true,
    };
  }

  /**
   * Verifies Razorpay payment signature
   */
  static verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (!this.keySecret) return true; // in mock mode accept test signatures

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Verifies Webhook signature from Razorpay
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true;

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return expected === signature;
  }
}
