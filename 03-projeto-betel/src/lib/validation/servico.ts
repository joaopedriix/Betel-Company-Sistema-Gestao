export type ServicoInput = {
  nome: string;
  descricao: string;
};

export type ServicoErros = Partial<Record<keyof ServicoInput, string>>;

export function validarServico(input: ServicoInput): ServicoErros {
  const erros: ServicoErros = {};

  const nome = input.nome.trim();
  if (!nome) erros.nome = "Informe o nome do serviço.";
  else if (nome.length < 2) erros.nome = "O nome deve ter pelo menos 2 caracteres.";
  else if (nome.length > 200) erros.nome = "O nome deve ter no máximo 200 caracteres.";

  if (input.descricao.length > 2000) {
    erros.descricao = "A descrição deve ter no máximo 2000 caracteres.";
  }

  return erros;
}
