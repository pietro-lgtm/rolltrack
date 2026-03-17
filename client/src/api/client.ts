const BASE_URL = import.meta.env.VITE_API_URL || '/api'

let currentUserId = 'user1'

export function setCurrentUserId(id: string) {
  currentUserId = id
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Id': currentUserId,
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(toSnakeCase(body))
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new ApiError(response.status, response.statusText, errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()
  return toCamelCase(json) as T
}

// Field aliases: API field name → client field name
// Applied AFTER snake_case → camelCase conversion
const FIELD_ALIASES: Record<string, string> = {
  sessionType: 'type',
  giNogi: 'gi',
  durationSecs: 'duration',
  classTimeSecs: 'classTime',
  sparringTimeSecs: 'sparringTime',
  drillingTimeSecs: 'drillingTime',
  feelingRating: 'feeling',
  intensityRating: 'intensity',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  weatherTempF: 'weatherTemp',
  weatherCondition: 'weatherCondition',
  weatherHumidity: 'weatherHumidity',
  isPublic: 'isPublic',
  sharedToFeed: 'sharedToFeed',
  photoUrl: 'photo',
  logoUrl: 'logo',
  bannerUrl: 'bannerImage',
  avatarUrl: 'avatar',
  beltRank: 'beltRank',
  dayOfWeek: 'dayOfWeek',
  startTime: 'startTime',
  endTime: 'endTime',
  hasOpenMat: 'hasOpenMat',
  allowsDropIns: 'allowsDropIns',
  dropInPrice: 'dropInPrice',
  scheduleCount: 'scheduleCount',
  likesCount: 'likes',
  commentsCount: 'comments',
  techniquesCount: 'techniquesCount',
  rollsCount: 'rollsCount',
  memberCount: 'memberCount',
  inviteCode: 'inviteCode',
}

// Convert snake_case keys to camelCase recursively, then apply aliases
function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      const finalKey = FIELD_ALIASES[camelKey] ?? camelKey
      result[finalKey] = toCamelCase(value)
    }
    return result
  }
  return obj
}

// Convert camelCase keys to snake_case recursively for outgoing requests
function toSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
      result[snakeKey] = toSnakeCase(value)
    }
    return result
  }
  return obj
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body)
  },

  del<T>(path: string): Promise<T> {
    return request<T>('DELETE', path)
  },
}
