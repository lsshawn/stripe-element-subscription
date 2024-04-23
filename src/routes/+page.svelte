<script>
	// https://docs.stripe.com/billing/subscriptions/overview#non-payment
	import { loadStripe } from '@stripe/stripe-js';
	import { Elements, PaymentElement } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';

	let stripe = null;
	let clientSecret = null;
	let processing = false;
	let completed = false;
	let elements;
	let customerId = null;
	let subscriptionId = null;

	const user = {
		email: 'shawn@test.com'
	};

	// const stripePrices = {
	// 	yearly: 'price_1P8d8hJFobipvfuFOqSAxT7v',
	// 	monthly: 'price_1P8d8hJFobipvfuFCcB2vJqg'
	// };
	const stripePrices = {
		yearly: 'price_1P8eQ1BezgnPCYvsN04HS2P2',
		monthly: 'price_1P8eQBBezgnPCYvsSv9nzxIN'
	};

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY);
		const customerRes = await fetch('/api/get-customer', {
			method: 'POST',
			body: JSON.stringify({ email: user.email })
		});
		const customerData = await customerRes.json();
		customerId = customerData.id;

		const getSubRes = await fetch('/api/get-subscription', {
			method: 'POST',
			body: JSON.stringify({ customer: customerId })
		});
		const getSubData = await getSubRes.json();
		console.log('LS -> src/routes/+page.svelte:43 -> getSubData: ', getSubData);
		if (getSubData.id && getSubData.clientSecret) {
			subscriptionId = getSubData.id;
			clientSecret = getSubData.clientSecret;
		} else {
			const createSubRes = await fetch('/api/create-subscription', {
				method: 'POST',
				body: JSON.stringify({ customer: customerId, priceId: stripePrices.yearly, trialDays: 7 })
			});
			const data = await createSubRes.json();
			clientSecret = data.clientSecret;
			subscriptionId = data.id;
		}
	});

	async function submit() {
		if (processing) return;
		processing = true;

		const { error } = await stripe.confirmSetup({
			elements,
			confirmParams: {
				return_url: 'http://localhost:5173'
			}
		});
		console.log('LS -> src/routes/+page.svelte:67 -> error: ', error);

		// const res = await stripe.confirmCardSetup(clientSecret, {
		// 	payment_method: {
		// 		card: cardElement,
		// 		billing_details: {
		// 			email: 'shawn@test.com'
		// 		}
		// 	}
		// });

		// const confirmed = res?.setupIntent?.id;
		// if (!confirmed) {
		// 	throw new Error('failed at confirmCardSetup');
		// }

		// const createRes = await fetch('/api/create-subscription', {
		// 	method: 'POST',
		// 	body: JSON.stringify({ customer: customerId, price: stripePrices['yearly'], trialDays: 7 })
		// });
		// const data = await createRes.json();
		// subscriptionId = data.id;
		processing = false;
		completed = true;
	}
</script>

{#if clientSecret}
	{#if completed}
		<div>Completed</div>
	{:else}
		<form on:submit|preventDefault={submit}>
			<Elements {stripe} {clientSecret} bind:elements>
				<PaymentElement />
			</Elements>

			<button>Pay</button>
		</form>
	{/if}
	<p>
		stripe customer id: {customerId}
	</p>
	<p>
		stripe subscriptionId id: {subscriptionId || '-'}
	</p>
{:else}
	Loading...
{/if}

<style>
	.error {
		color: tomato;
		margin: 2rem 0 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 2rem 0;
	}

	.row {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}

	input,
	:global(.input) {
		border: solid 1px var(--gray-color);
		padding: 1rem;
		border-radius: 5px;
		background: white;
	}

	.row :global(.input) {
		width: 20%;
	}

	button {
		padding: 1rem;
		border-radius: 5px;
		border: solid 1px #ccc;
		color: white;
		background: #333;
		font-size: 1.2rem;
		margin: 1rem 0;
	}
</style>
