export interface IParcel {
  id: number
  userId: number
  barcode: string
  arrived: boolean
  delivered: boolean
  updatedAt: number
}

export interface IParcelSave {
  userId: number
  barcode: string
  updatedAt: number
}

export interface IParcelUpdate {
  id: number
  arrived: boolean
  delivered: boolean
  updatedAt: number
}
