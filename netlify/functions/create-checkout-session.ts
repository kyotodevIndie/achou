// netlify/functions/create-checkout-session.ts
import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

// Usar chave hardcoded temporariamente (problema com env do Netlify CLI)
const supabase = createClient(
  'https://cpmebovurkonvpqlashq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbWVib3Z1cmtvbnZwcWxhc2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MDE3MSwiZXhwIjoyMDcyOTM2MTcxfQ.X6jRUhCVjJHV7ihGkxkUpoAp1iPFShf_q7DoS4hH-Og',
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
    const { professional_id, plan_id } = JSON.parse(event.body || '{}')

    console.log('Received data:', { professional_id, plan_id })

    if (!professional_id || !plan_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    // Buscar dados do plano
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Plan not found' }),
      }
    }

    // Buscar dados do profissional
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('name, email')
      .eq('id', professional_id)
      .single()

    if (professionalError || !professional) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Professional not found' }),
      }
    }

    // Criar ou buscar customer no Stripe
    let customer
    const existingCustomers = await stripe.customers.list({
      email: professional.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: professional.email,
        name: professional.name,
        metadata: {
          professional_id: professional_id,
        },
      })
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: plan.trial_period_days,
        metadata: {
          professional_id: professional_id,
          plan_id: plan_id,
        },
      },
      success_url: `${process.env.URL || 'http://localhost:8888'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/payment/cancelled`,
      locale: 'pt-BR',
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkout_url: session.url,
        session_id: session.id,
      }),
    }
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
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
