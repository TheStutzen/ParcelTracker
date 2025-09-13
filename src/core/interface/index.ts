interface IEvents {
  position: number
  eventDate: number
  operation: string
  location: string
  zipCode: string
  delivered?: boolean
  accepted?: boolean
  arrived?: boolean
}

interface IStatus {
  barcode: string
  carrier: { code: string; name: string }
  originCountry: { code: string; name: string }
  attributes: {
    sender: string
    recipient: string
    type: string
    insurance: string
  }
  createdAt: number
  updatedAt: number
  deliveringTime: number
  weight: number
  arrived: boolean
  delivered: boolean
  events: IEvents[]
}

export interface IWhereParcel {
  ok: boolean
  message?: string
  status?: IStatus
}

export interface ITrackParcel {
  ok: boolean
  message?: string
}
