// IMPORTANT: Change REDIRECT_URI to your production domain when deploying
export const DISCORD_CONFIG = {
  CLIENT_ID: "1432818764885393552",
  CLIENT_SECRET: "TU_CLIENT_SECRET_AQUI", // Reemplaza esto con tu Client Secret de Discord
  REDIRECT_URI: "http://localhost:3000/api/auth/discord/callback", // Cambia a tu dominio en producción
  SCOPES: "identify",
}

// Para producción, cambia REDIRECT_URI a:
// "https://tudominio.com/api/auth/discord/callback"
