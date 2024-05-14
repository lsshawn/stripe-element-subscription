<script>
	// https://docs.stripe.com/billing/subscriptions/overview#non-payment
	import { loadStripe } from '@stripe/stripe-js';
	import { PaymentRequestButton, Elements, CardNumber, CardExpiry, CardCvc } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';

	let stripe = null;
	let clientSecret = null;
	let processing = false;
	let completed = false;
	let cardElement;
	let customerId = null;
	let subscriptionId = null;

	const user = {
		email: 'shawn@test.com'
	};

	const stripePrices = {
		yearly: 'price_1P8d8hJFobipvfuFOqSAxT7v',
		monthly: 'price_1P8d8hJFobipvfuFCcB2vJqg'
	};

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY);
		const res = await fetch('/api/setup-intent', {
			method: 'POST',
			body: JSON.stringify({ user })
		});
		const data = await res.json();
		clientSecret = data.clientSecret;
		customerId = data.customer;
	});

	async function submit() {
		if (processing) return;
		processing = true;

		// if use PaymentElement, change this to confirmSetup
		const res = await stripe.confirmCardSetup(clientSecret, {
			payment_method: {
				card: cardElement,
				billing_details: {
					email: 'shawn@test.com'
				}
			}
		});

		const confirmed = res?.setupIntent?.id;
		if (!confirmed) {
			throw new Error('failed at confirmCardSetup');
		}

		const paymentMethodId = res.setupIntent.payment_method;

		const createRes = await fetch('/api/create-subscription', {
			method: 'POST',
			body: JSON.stringify({
				customer: customerId,
				price: stripePrices['yearly'],
				trialDays: 7,
				paymentMethodId
			})
		});
		const data = await createRes.json();
		subscriptionId = data.id;
		processing = false;
		completed = true;
	}

	const paymentRequest = {
		country: 'AU',
		currency: 'AUD',
		total: { label: 'Demo total', amount: 1099 },
		requestPayerName: true,
		requestPayerEmail: true
	};
</script>

{#if clientSecret}
	{#if completed}
		<div>Completed</div>
	{:else}
		<input type="text" value={user.email} />
		<Elements {stripe} {clientSecret}>
			<form on:submit|preventDefault={submit}>
				Apple pay:
				<PaymentRequestButton {paymentRequest} on:paymentmethod={submit} />
				Card:
				<!-- <PaymentElement /> -->
				<CardNumber bind:element={cardElement} classes={{ base: 'input' }} />

				<div class="row">
					<CardExpiry classes={{ base: 'input' }} />
					<CardCvc classes={{ base: 'input' }} />
				</div>

				<button disabled={processing}>
					{#if processing}
						Processing...
					{:else}
						Pay
					{/if}
				</button>
			</form>
		</Elements>
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
