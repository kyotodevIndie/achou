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

    if (!professional_id || !plan_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      console.error('Plan not found:', planError)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Plan not found' }),
      }
    }

    if (!plan.stripe_price_id) {
      console.error('Plan missing stripe_price_id')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Plan not configured properly' }),
      }
    }

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('name, email, user_id')
      .eq('id', professional_id)
      .single()

    if (professionalError || !professional) {
      console.error('Professional not found:', professionalError)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Professional not found' }),
      }
    }

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
          user_id: professional.user_id,
        },
      })
      
    }

    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    })

    if (existingSubscriptions.data.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Customer already has an active subscription',
          subscription_id: existingSubscriptions.data[0].id,
        }),
      }
    }

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
        metadata: {
          professional_id: professional_id,
          plan_id: plan_id,
          user_id: professional.user_id,
        },
      },
      success_url: `${process.env.URL || 'http://localhost:8888'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/payment/cancelled`,
      locale: 'pt-BR',
      billing_address_collection: 'required',
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
