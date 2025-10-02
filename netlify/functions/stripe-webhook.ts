// netlify/functions/stripe-webhook.ts - VERSÃO CORRIGIDA
import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('Webhook received:', event.httpMethod)

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const sig = event.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!sig) {
    console.error('Missing stripe-signature header')
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing stripe-signature header' }),
    }
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body!, sig, endpointSecret)
    console.log('Webhook verified:', stripeEvent.type)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' }),
    }
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)

  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionCreated(subscription)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)

  const professionalId = subscription.metadata?.professional_id
  const planId = subscription.metadata?.plan_id

  if (!professionalId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id, subscription.metadata)
    return
  }

  try {
    // Type assertion para acessar propriedades do Stripe
    const sub = subscription as any

    // Criar/atualizar registro da assinatura
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          professional_id: professionalId,
          plan_id: planId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end || false,
        },
        {
          onConflict: 'stripe_subscription_id',
        },
      )
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return
    }

    console.log('Subscription created in DB:', subscriptionData)

    // Ativar profissional
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'

    const { error: professionalError } = await supabase
      .from('professionals')
      .update({
        subscription_status: subscription.status,
        subscription_id: subscriptionData.id,
        is_active: isActive,
        subscription_expires_at: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        is_on_trial: subscription.status === 'trialing',
        trial_expires_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      })
      .eq('id', professionalId)

    if (professionalError) {
      console.error('Error updating professional:', professionalError)
    } else {
      console.log('Professional activated:', professionalId)
    }
  } catch (err) {
    console.error('Error in handleSubscriptionCreated:', err)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)

  try {
    // Type assertion para acessar propriedades do Stripe
    const sub = subscription as any

    // Atualizar registro da assinatura
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      })
      .eq('stripe_subscription_id', subscription.id)

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
      return
    }

    // Buscar professional_id
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('professional_id, id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subscriptionData) {
      const isActive = subscription.status === 'active' || subscription.status === 'trialing'

      const { error: professionalError } = await supabase
        .from('professionals')
        .update({
          subscription_status: subscription.status,
          subscription_id: subscriptionData.id,
          is_active: isActive,
          subscription_expires_at: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          is_on_trial: subscription.status === 'trialing',
          trial_expires_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        })
        .eq('id', subscriptionData.professional_id)

      if (professionalError) {
        console.error('Error updating professional:', professionalError)
      } else {
        console.log(
          'Professional updated:',
          subscriptionData.professional_id,
          'Status:',
          subscription.status,
        )
      }
    }
  } catch (err) {
    console.error('Error in handleSubscriptionUpdated:', err)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)

  try {
    // Atualizar registro da assinatura
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
      return
    }

    // Desativar profissional
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('professional_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subscriptionData) {
      const { error: professionalError } = await supabase
        .from('professionals')
        .update({
          subscription_status: 'canceled',
          is_active: false,
          is_on_trial: false,
          trial_expires_at: null,
        })
        .eq('id', subscriptionData.professional_id)

      if (professionalError) {
        console.error('Error updating professional:', professionalError)
      } else {
        console.log('Professional deactivated:', subscriptionData.professional_id)
      }
    }
  } catch (err) {
    console.error('Error in handleSubscriptionDeleted:', err)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id)

  // Type assertion para acessar propriedades que existem em runtime
  const inv = invoice as any
  const subscriptionId = inv.subscription as string | undefined

  if (subscriptionId) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('professional_id, plan_id, id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (subscriptionData) {
      // Registrar transação
      const { error } = await supabase.from('payment_transactions').insert({
        subscription_id: subscriptionData.id,
        professional_id: subscriptionData.professional_id,
        amount_cents: invoice.amount_paid || 0,
        currency: (invoice.currency || 'brl').toUpperCase(),
        status: 'succeeded',
        payment_method: 'card',
        processed_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error creating transaction:', error)
      } else {
        console.log('Transaction recorded for professional:', subscriptionData.professional_id)
      }
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)

  // Type assertion para acessar propriedades que existem em runtime
  const inv = invoice as any
  const subscriptionId = inv.subscription as string | undefined

  if (subscriptionId) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('professional_id, id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (subscriptionData) {
      // Registrar transação falhada
      const { error } = await supabase.from('payment_transactions').insert({
        subscription_id: subscriptionData.id,
        professional_id: subscriptionData.professional_id,
        amount_cents: invoice.amount_due || 0,
        currency: (invoice.currency || 'brl').toUpperCase(),
        status: 'failed',
        failure_reason: 'payment_failed',
        processed_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error creating failed transaction:', error)
      } else {
        console.log(
          'Failed transaction recorded for professional:',
          subscriptionData.professional_id,
        )
      }
    }
  }
}
