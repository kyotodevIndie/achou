import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'



const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface ReviewData {
  professional_id: string
  user_name: string
  email?: string
  rating: number
  comment?: string
  captchaToken: string
}

async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  try {
    
    const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: HCAPTCHA_SECRET,
        response: token,
        remoteip: ip,
      }),
    })

    const data = await response.json()
    
    return data.success === true
  } catch (error) {
    console.error('❌ Erro ao verificar captcha:', error)
    return false
  }
}

function validateReviewData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.professional_id || typeof data.professional_id !== 'string') {
    errors.push('ID do profissional inválido')
  }

  if (!data.user_name || typeof data.user_name !== 'string' || data.user_name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres')
  }

  if (!data.rating || typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    errors.push('Avaliação deve ser entre 1 e 5 estrelas')
  }

  if (data.comment && typeof data.comment === 'string' && data.comment.length > 500) {
    errors.push('Comentário muito longo (máximo 500 caracteres)')
  }

  if (!data.captchaToken || typeof data.captchaToken !== 'string') {
    errors.push('Captcha inválido')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const handler: Handler = async (event) => {
  
  

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    }
  }

  try {
    const data: ReviewData = JSON.parse(event.body || '{}')
    ,
    })

    // Validar dados
    const validation = validateReviewData(data)
    if (!validation.valid) {
      
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Dados inválidos',
          details: validation.errors,
        }),
      }
    }

    // Obter IP do usuário
    const ip =
      event.headers['x-forwarded-for']?.split(',')[0] || event.headers['x-real-ip'] || 'localhost'
    

    // Verificar captcha
    const captchaValid = await verifyCaptcha(data.captchaToken, ip)
    if (!captchaValid) {
      
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Captcha inválido ou expirado' }),
      }
    }

    // Criar review no banco
    
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        professional_id: data.professional_id,
        user_name: data.user_name.trim(),
        rating: data.rating,
        comment: data.comment?.trim() || null,
        email: data.email?.trim() || null,
      })
      .select()
      .single()

    if (reviewError) {
      console.error('❌ Erro ao criar review:', reviewError)
      throw reviewError
    }

    

    // Atualizar rating do profissional
    
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('professional_id', data.professional_id)

    if (allReviews && allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = totalRating / allReviews.length

      await supabase
        .from('professionals')
        .update({
          rating: avgRating,
          review_count: allReviews.length,
        })
        .eq('id', data.professional_id)

      } (${allReviews.length} reviews)`)
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        review,
      }),
    }
  } catch (error) {
    console.error('💥 Erro na função:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro ao processar avaliação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
    }
  }
}
