export interface UserConfig {
  name: string
  config?: Config
}

export interface Config {
  copyright?: string
  company?: string
  authors?: string
  product?: string
  description?: string
}
