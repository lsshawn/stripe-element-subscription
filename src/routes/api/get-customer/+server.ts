import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';

export async function POST({ request }) {
	const { email } = await request.json();
	const customer = await getCustomer(email);
	return json({ id: customer.id });
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
