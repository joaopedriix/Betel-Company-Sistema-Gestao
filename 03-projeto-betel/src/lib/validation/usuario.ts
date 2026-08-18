export type UsuarioPerfilCadastravel = "admin" | "socio";

export type UsuarioInput = {
  nome: string;
  email: string;
  perfil: string;
};

export type UsuarioErros = Partial<Record<keyof UsuarioInput, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS_VALIDOS: UsuarioPerfilCadastravel[] = ["admin", "socio"];

export function validarUsuario(input: UsuarioInput): UsuarioErros {
  const erros: UsuarioErros = {};

  const nome = input.nome.trim();
  if (!nome) erros.nome = "Informe o nome.";
  else if (nome.length < 2) erros.nome = "O nome deve ter pelo menos 2 caracteres.";

  const email = input.email.trim();
  if (!email) erros.email = "Informe o email.";
  else if (!EMAIL_REGEX.test(email)) erros.email = "Informe um email válido.";

  if (!PERFIS_VALIDOS.includes(input.perfil as UsuarioPerfilCadastravel)) {
    erros.perfil = "Selecione um perfil válido.";
  }

  return erros;
}

export function gerarSenhaTemporaria(): string {
  // 16 caracteres alfanuméricos — só usada uma vez, exibida ao admin
  // logo após a criação para repassar ao novo usuário trocar depois.
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
}
