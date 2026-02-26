import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const priceMap = {
  pricing_engine: process.env.PRICE_PRICING_ENGINE,
  strategy_1040: process.env.PRICE_1040_STRATEGY,
  entity_playbook: process.env.PRICE_ENTITY_PLAYBOOK,
  bundle: process.env.PRICE_BUNDLE,
  tax_diagnostic: process.env.PRICE_TAX_DIAGNOSTIC,
  annual_plan_deposit: process.env.PRICE_ANNUAL_PLAN_DEPOSIT,
  high_income_w2: process.env.PRICE_HIGH_INCOME_W2,
  mini_tax_checklist: process.env.PRICE_MINI_TAX_CHECKLIST
};

app.use(express.static(path.join(__dirname, 'public')));
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { productKey } = req.body;
    const price = priceMap[productKey];

    if (!price) {
      return res.status(400).json({ error: 'Invalid product key' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel.html`,
      metadata: { productKey }
    });

    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/webhook/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Missing STRIPE_WEBHOOK_SECRET');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment complete:', session.id, session.metadata?.productKey);
    // TODO: Fulfillment hook (email delivery / access grant)
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`RHW store running at http://localhost:${port}`);
});
