import axios, { AxiosInstance } from 'axios'

export class AxiosLib {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      validateStatus: (status) => status < 500
    })
  }

  async post(url: string, data: any, headers: any) {
    return await this.client.post(url, data, headers)
  }

  async get(url: string, headers: any) {
    return await this.client.get(url, headers)
  }

  async patch(url: string, headers: any) {
    return await this.client.patch(url, headers)
  }

  async put(url: string) {
    return await this.client.put(url)
  }

  async delete(url: string, headers: any) {
    return await this.client.delete(url, headers)
  }
}
