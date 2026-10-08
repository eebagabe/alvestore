/** Só aceita caminhos internos para não virar redirecionamento aberto. */
export const safeRedirect = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/minha-conta'
