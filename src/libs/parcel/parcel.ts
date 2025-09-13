import { axios } from '../axios'

export class MyParcel {
  url: string

  constructor() {
    this.url = process.env.URL

    if (!this.url) {
      throw new Error('Missing required environment variable: URL')
    }
  }

  async getCarrierParcel(barcode: string) {
    try {
      const response = await axios.get(this.url + `carriers/${barcode}`, {})

      return response.data[0].code
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async getStatusParcel(carrier: string, barcode: string) {
    try {
      const response = await axios.get(
        this.url + `trackers/${carrier}/${barcode}`,
        {}
      )

      return response.data
    } catch (err) {
      console.error(err)
      return null
    }
  }
}
