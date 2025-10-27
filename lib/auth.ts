export const CREDENTIALS = {
  username: "VlizzzSupport",
  password: "Vlixx2.0",
}

export function validateCredentials(username: string, password: string): boolean {
  return username === CREDENTIALS.username && password === CREDENTIALS.password
}
