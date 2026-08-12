type ValidationDetail = {
  msg?: string
}

type ErrorPayload = {
  detail?: string | ValidationDetail[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function errorMessage(response: Response): Promise<string> {
  const fallback = 'No se ha podido completar la solicitud'

  try {
    const payload = (await response.json()) as ErrorPayload

    if (typeof payload.detail === 'string') {
      return payload.detail
    }

    return (
      payload.detail?.find((detail) => typeof detail.msg === 'string')?.msg ??
      fallback
    )
  } catch {
    return fallback
  }
}

export async function apiRequest(
  path: `/api/${string}`,
  init?: RequestInit,
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
    })
  } catch {
    throw new ApiError('No se ha podido conectar con el servidor', 0)
  }

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status)
  }

  return response
}
