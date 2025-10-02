// netlify/functions/cancel-subscription.ts - VERSÃO CORRIGIDA
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
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { subscription_id } = JSON.parse(event.body || '{}')

    if (!subscription_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing subscription_id' }),
      }
    }

    // Buscar assinatura no banco
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, professional_id')
      .eq('id', subscription_id)
      .single()

    if (dbError || !subscription) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Subscription not found' }),
      }
    }

    if (!subscription.stripe_subscription_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No Stripe subscription found' }),
      }
    }

    // Cancelar no Stripe (no final do período)
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      },
    )

    // Type assertion para acessar current_period_end
    const sub = stripeSubscription as any

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('id', subscription_id)

    if (updateError) {
      console.error('Error updating subscription in database:', updateError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update subscription' }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Subscription will be canceled at the end of current period',
        cancel_at: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      }),
    }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
