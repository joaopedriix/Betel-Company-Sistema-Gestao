export type ContratoInput = {
  eventoId: string;
  servicoIds: string[];
};

export type ContratoErros = {
  eventoId?: string;
  servicoIds?: string;
};

export function validarContrato(input: ContratoInput): ContratoErros {
  const erros: ContratoErros = {};

  if (!input.eventoId) erros.eventoId = "Selecione o evento.";
  if (input.servicoIds.length === 0) {
    erros.servicoIds = "Selecione ao menos um serviço.";
  }

  return erros;
}
