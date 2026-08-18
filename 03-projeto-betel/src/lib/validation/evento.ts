export const AREAS_NEGOCIO = ["noivas", "eventos", "decoracoes", "estudio"] as const;
export type AreaNegocio = (typeof AREAS_NEGOCIO)[number];

export const LABEL_AREA_NEGOCIO: Record<AreaNegocio, string> = {
  noivas: "Betel Noivas",
  eventos: "Betel Eventos",
  decoracoes: "Betel Decorações",
  estudio: "Betel Estúdio",
};

export type EventoInput = {
  nome: string;
  clienteId: string;
  dataEvento: string;
  area: string;
};

export type EventoErros = Partial<Record<keyof EventoInput, string>>;

export function validarEvento(input: EventoInput): EventoErros {
  const erros: EventoErros = {};

  const nome = input.nome.trim();
  if (!nome) erros.nome = "Informe o nome do evento.";
  else if (nome.length > 200) erros.nome = "O nome deve ter no máximo 200 caracteres.";

  if (!input.clienteId) erros.clienteId = "Selecione o cliente.";

  if (input.dataEvento && Number.isNaN(Date.parse(input.dataEvento))) {
    erros.dataEvento = "Informe uma data válida.";
  }

  if (input.area && !AREAS_NEGOCIO.includes(input.area as AreaNegocio)) {
    erros.area = "Selecione uma área válida.";
  }

  return erros;
}
