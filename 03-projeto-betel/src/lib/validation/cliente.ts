export type ClienteInput = {
  nome: string;
  email: string;
  telefone: string;
};

export type ClienteErros = Partial<Record<keyof ClienteInput, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Aceita dígitos, espaços, parênteses, hífen e "+", 8 a 20 caracteres.
const TELEFONE_REGEX = /^[\d\s()+-]{8,20}$/;

export function validarCliente(input: ClienteInput): ClienteErros {
  const erros: ClienteErros = {};

  const nome = input.nome.trim();
  if (!nome) {
    erros.nome = "Informe o nome do cliente.";
  } else if (nome.length < 2) {
    erros.nome = "O nome deve ter pelo menos 2 caracteres.";
  } else if (nome.length > 200) {
    erros.nome = "O nome deve ter no máximo 200 caracteres.";
  }

  const email = input.email.trim();
  if (email && !EMAIL_REGEX.test(email)) {
    erros.email = "Informe um email válido.";
  }

  const telefone = input.telefone.trim();
  if (telefone && !TELEFONE_REGEX.test(telefone)) {
    erros.telefone = "Informe um telefone válido.";
  }

  return erros;
}
