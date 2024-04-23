import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';

export async function POST({ request }) {
	const { user } = await request.json();
	const customer = await getCustomer(user.email);
	const setupIntent = await stripe.setupIntents.create({
		payment_method_types: ['card', 'card_present'],
		customer: customer.id
	});

	return json({ clientSecret: setupIntent.client_secret, customer: customer.id });
}

async function getCustomer(email: string) {
	const existingCustomer = await stripe.customers.list({
		email
	});

	if (existingCustomer?.data?.length) {
		return existingCustomer.data[0];
	} else {
		return await stripe.customers.create({
			email
		});
	}
}
