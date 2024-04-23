import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';

export async function POST({ request }) {
	const { customer } = await request.json();
	const data = await stripe.subscriptions.list({ customer });
	if (data?.data?.length) {
		const subscription = data.data[0];
		const pendingSetupIntent = subscription.pending_setup_intent;

		const setupIntent = await stripe.setupIntents.retrieve(pendingSetupIntent);

		return json({ id: data.data[0].id, clientSecret: setupIntent.client_secret });
	}
	return json({ id: null, clientSecret: null });
}
