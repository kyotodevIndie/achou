import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

console.log('🔧 Função create-review carregada')

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
    console.log('🔐 Verificando captcha...', { token: token.substring(0, 20), ip })

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
    console.log('🔐 Resposta do captcha:', data)
    return data.success === true
  } catch (error) {
    console.error('❌ Erro ao verificar captcha:', error)
    return false
  }
}

async function checkIPLimit(
  professionalId: string,
  ip: string,
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    console.log('🔍 Verificando limite de IP...', { professionalId, ip })

    const { data, error } = await supabase
      .from('review_ips')
      .select('created_at')
      .eq('professional_id', professionalId)
      .eq('ip_address', ip)
      .gte('created_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('❌ Erro ao verificar IP:', error)
      throw error
    }

    console.log('📊 Reviews encontradas para este IP:', data?.length || 0)

    if (data && data.length > 0) {
      return {
        allowed: false,
        message: 'Você já avaliou este profissional recentemente. Aguarde 24 horas.',
      }
    }

    const { data: allReviews, error: allError } = await supabase
      .from('review_ips')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', twentyFourHoursAgo.toISOString())

    if (allError) throw allError

    console.log('📊 Total de reviews deste IP hoje:', allReviews?.length || 0)

    if (allReviews && allReviews.length >= 5) {
      return {
        allowed: false,
        message: 'Limite de avaliações diário atingido. Tente novamente amanhã.',
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('❌ Erro ao verificar limite IP:', error)
    return { allowed: true }
  }
}

async function saveIPTracking(professionalId: string, ip: string) {
  try {
    console.log('💾 Salvando tracking de IP...')
    await supabase.from('review_ips').insert({
      professional_id: professionalId,
      ip_address: ip,
    })
    console.log('✅ IP tracking salvo')
  } catch (error) {
    console.error('❌ Erro ao salvar tracking IP:', error)
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
  console.log('🚀 Função create-review chamada')
  console.log('📝 Method:', event.httpMethod)

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    }
  }

  try {
    const data: ReviewData = JSON.parse(event.body || '{}')
    console.log('📦 Dados recebidos:', {
      ...data,
      captchaToken: data.captchaToken?.substring(0, 20),
    })

    const validation = validateReviewData(data)
    if (!validation.valid) {
      console.log('❌ Validação falhou:', validation.errors)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Dados inválidos',
          details: validation.errors,
        }),
      }
    }

    const ip =
      event.headers['x-forwarded-for']?.split(',')[0] || event.headers['x-real-ip'] || 'localhost'

    console.log('🌐 IP do usuário:', ip)

    const captchaValid = await verifyCaptcha(data.captchaToken, ip)
    if (!captchaValid) {
      console.log('❌ Captcha inválido')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Captcha inválido ou expirado' }),
      }
    }

    const ipCheck = await checkIPLimit(data.professional_id, ip)
    if (!ipCheck.allowed) {
      console.log('❌ Limite de IP atingido')
      return {
        statusCode: 429,
        body: JSON.stringify({ error: ipCheck.message }),
      }
    }

    console.log('💾 Criando review no banco...')
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

    console.log('✅ Review criada:', review.id)

    await saveIPTracking(data.professional_id, ip)

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
