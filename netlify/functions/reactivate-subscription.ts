// netlify/functions/reactivate-subscription.ts
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
      .select('stripe_subscription_id, professional_id, status')
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

    // Verificar se pode ser reativada
    if (subscription.status === 'active') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Subscription is already active' }),
      }
    }

    // Reativar no Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      },
    )

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        status: stripeSubscription.status,
        canceled_at: null,
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

    // Reativar profissional se necessário
    const { error: professionalError } = await supabase
      .from('professionals')
      .update({
        subscription_status: stripeSubscription.status,
        is_active:
          stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing',
      })
      .eq('id', subscription.professional_id)

    if (professionalError) {
      console.error('Error updating professional:', professionalError)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Subscription reactivated successfully',
        status: stripeSubscription.status,
      }),
    }
  } catch (error) {
    console.error('Error reactivating subscription:', error)
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
