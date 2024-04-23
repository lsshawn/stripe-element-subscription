import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';

export async function POST({ request }) {
	const { customer, price, trialDays } = await request.json();
	const res = await stripe.subscriptions.create({
		customer,
		items: [{ price }],
		payment_settings: { save_default_payment_method: 'on_subscription' },
		trial_period_days: trialDays
	});
	return json(res);
}
