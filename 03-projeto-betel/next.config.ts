import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Só em dev: permite testar via o túnel de preview do GitHub
  // Codespaces. O proxy de port-forwarding do Codespaces repassa a
  // requisição para localhost:3000 reescrevendo o header Origin (mas
  // preservando x-forwarded-host com o domínio *.app.github.dev
  // original) — por isso são necessárias as duas entradas: o domínio
  // do túnel (Origin visto direto do navegador) e localhost:3000
  // (Origin visto depois do proxy interno). Proteção CSRF de Server
  // Actions. Não afeta produção (NODE_ENV=production).
  ...(process.env.NODE_ENV !== "production" && {
    experimental: {
      serverActions: {
        allowedOrigins: ["*.app.github.dev", "localhost:3000"],
      },
    },
  }),
};

export default nextConfig;
