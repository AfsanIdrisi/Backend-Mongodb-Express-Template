import Razorpay from "razorpay";
import User from "../models/user.models.js";
import crypto from "crypto";
const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,       // from Razorpay Dashboard
    key_secret: process.env.VITE_RAZORPAY_KEY_SECRET
});

export const resumeAutopay = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({id:userId});
    if (!user || !user.subscriptionId) {
      return res.status(400).json({ message: "User or subscription not found" });
    }

    // Step 1: Fetch old subscription from Razorpay
    const oldSub = await razorpay.subscriptions.fetch(user.subscriptionId);
    if (!oldSub.plan_id) {
      return res.status(400).json({ message: "No plan found for old subscription" });
    }

    // Step 2: Create new subscription using the old plan
    const newSub = await razorpay.subscriptions.create({
      plan_id: oldSub.plan_id,
      total_count: 84, // or match your plan logic
      customer_notify: 1
    });

    // Step 3: Update user record
    user.subscriptionId = newSub.id;
    user.autopay = true;
    user.grace_period = null;
    await user.save();

    res.json({
      message: "Autopay resumed successfully",
      success:true,
      subscription: newSub
    });
  } catch (err) {
    console.error("Error resuming autopay:", err);
    res.status(500).json({ message: "Failed to resume autopay" });
  }
};

export const createOrder =  async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100,  // amount in paise
            currency: "INR",
            receipt: "receipt_order_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating order", err.message);
    }
}

export  const createSubscription = async (req, res) => {
    try {
        const { planId, total_count = 84 } = req.body;
        console.log(planId, total_count)

        // Convert Dec 2, 2025 to a Unix timestamp (UTC)
        const startAt = Math.floor(new Date('2025-12-02T00:00:00Z').getTime() / 1000);

        // Create the subscription with ₹1 trial authorization
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count,
            customer_notify: 1,
            start_at: startAt,
            addons: [
                {
                    item: {
                        name: 'Trial Authorization',
                        amount: 1000, // ₹1 in paise
                        currency: 'INR',
                    },
                },
            ],
        });

        return res.json(subscription);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'subscription-create-failed', details: err.message });
    }
}

export const webhook =  async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify Razorpay signature
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('⚠️ Invalid Razorpay signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;

        const payload = req.body.payload;

        switch (event) {
            // 🔹 Initial trial / setup payment success
            case 'payment.captured': {
                const payment = payload.payment.entity;
                console.log(`💰 Payment captured: ₹${payment.amount / 100}`);

                // Refund your ₹5/₹1 trial authorization
                if (payment.amount <= 1500) {
                    try {
                        await razorpay.payments.refund(payment.id, { amount: payment.amount });
                        console.log(`✅ Refunded ₹${payment.amount / 100} for trial payment ${payment.id}`);
                    } catch (refundErr) {
                        console.error(`Refund failed for ${payment.id}:`, refundErr.message);
                    }
                }

                // await User.findOneAndUpdate({ id }, {autopay:true, grace_period:null});
                break;
            }

            // 🔹 Subscription successfully charged automatically
            case 'subscription.charged': {
                const subscription = payload.subscription.entity;
                console.log(`🔁 Subscription charged successfully: ${subscription.id}`);

                // Example: update user access / renew subscription in your DB
                await updateUserSubscription(subscription.customer_id, subscription.id, 'active');
                break;
            }

            // 🔹 Payment failed for auto-debit
            case 'payment.failed': {
                const failedPayment = payload.payment.entity;
                console.error(`❌ Payment failed for ${failedPayment.id}`);
                // Example: notify user or mark subscription as pending payment
                break;
            }

            // Optional: Subscription cancelled or completed
            case 'subscription.cancelled':
                const subscription = payload.subscription.entity;
                const endDate = new Date(subscription.end_at * 1000);
                const gracePeriod = new Date(endDate.getTime() + 15 * 24 * 60 * 60 * 1000);

                await User.findOneAndUpdate(
                    { subscriptionId: subscription.id },
                    { autopay: false, grace_period: gracePeriod }
                );

                // console.log(subssc)
                // const user = await 
                break;
            case 'subscription.completed': {
                const subscription = payload.subscription.entity;
                console.log(`⚠️ Subscription ${event}: ${subscription.id}`);
                // await updateUserSubscription(subscription.customer_id, subscription.id, event);
                break;
            }

            default:
                console.log(`Unhandled Razorpay event: ${event}`);
                break;
        }

        res.status(200).json({ status: 'ok', payload });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'webhook-processing-failed' });
    }
}

export const verifySubscription = (req, res) => {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    const generated_signature = crypto.createHmac('sha256', process.env.VITE_RAZORPAY_KEY_SECRET)
        .update(razorpay_payment_id + '|' + razorpay_subscription_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Save payment_id & subscription_id to DB, mark subscription as authenticated/active
        return res.json({ ok: true });
    } else {
        return res.status(400).json({ ok: false, error: 'invalid-signature' });
    }
}

