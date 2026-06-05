import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { owner, repo, title, body, labels } = await request.json()

    // Validar campos requeridos
    if (!owner || !repo || !title || !body) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: owner, repo, title, body' },
        { status: 400 }
      )
    }

    // Obtener token de GitHub desde variables de entorno
    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN no configurado en variables de entorno' },
        { status: 500 }
      )
    }

    // Crear issue en GitHub
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: labels || [],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('GitHub API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Error al crear issue en GitHub' },
        { status: response.status }
      )
    }

    const issue = await response.json()

    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        number: issue.number,
        url: issue.html_url,
      },
    })
  } catch (error) {
    console.error('Error en create-issue:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
