export type TarefaPadraoInput = {
  nome: string;
  descricao: string;
  responsavelPadraoId: string;
  prazoOffsetDias: string;
  prioridade: string;
  ordem: string;
  visivelAoCliente: boolean;
};

export type TarefaPadraoErros = Partial<
  Record<keyof Omit<TarefaPadraoInput, "visivelAoCliente">, string>
>;

const PRIORIDADES_VALIDAS = ["baixa", "media", "alta"];

export function validarTarefaPadrao(input: TarefaPadraoInput): TarefaPadraoErros {
  const erros: TarefaPadraoErros = {};

  const nome = input.nome.trim();
  if (!nome) erros.nome = "Informe o nome da tarefa.";
  else if (nome.length > 200) erros.nome = "O nome deve ter no máximo 200 caracteres.";

  if (input.descricao.length > 2000) {
    erros.descricao = "A descrição deve ter no máximo 2000 caracteres.";
  }

  if (!PRIORIDADES_VALIDAS.includes(input.prioridade)) {
    erros.prioridade = "Selecione uma prioridade válida.";
  }

  if (input.prazoOffsetDias.trim() && !/^-?\d+$/.test(input.prazoOffsetDias.trim())) {
    erros.prazoOffsetDias = "Informe um número inteiro de dias (ex.: -30).";
  }

  if (input.ordem.trim() && !/^\d+$/.test(input.ordem.trim())) {
    erros.ordem = "Informe um número inteiro para a ordem.";
  }

  return erros;
}
