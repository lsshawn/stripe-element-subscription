import Stripe from 'stripe';
import { STRIPE_SECRET } from '$env/static/private';

export const stripe = Stripe(STRIPE_SECRET, {
	apiVersion: '2022-11-15'
});
