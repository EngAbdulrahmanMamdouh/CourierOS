export type City = {
  id: number
  name: string
  code: string
  governorate: string
  is_active: boolean
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type CityCreatePayload = {
  name: string
  code: string
  governorate: string
  is_active?: boolean
}

export type CityUpdatePayload = CityCreatePayload
