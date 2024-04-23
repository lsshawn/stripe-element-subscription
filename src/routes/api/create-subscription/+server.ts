import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';

export async function POST({ request }) {
	const { customer, priceId, trialDays } = await request.json();
	const subscription = await stripe.subscriptions.create({
		customer,
		items: [{ price: priceId }],
		trial_period_days: trialDays,
		payment_behavior: 'default_incomplete',
		payment_settings: { save_default_payment_method: 'on_subscription' },
		expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
	});
	// if free triail, use pending_setup_intent
	if (subscription?.pending_setup_intent) {
		return json({
			clientSecret: subscription.pending_setup_intent.client_secret,
			id: subscription.id
		});
	} else {
		return json({ clientSecret: subscription.payment_intent.client_secret, id: subscription.id });
	}
}
