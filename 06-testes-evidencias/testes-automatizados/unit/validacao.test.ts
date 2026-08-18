import { describe, expect, it } from "vitest";
import { validarCliente } from "@/lib/validation/cliente";
import { validarContrato } from "@/lib/validation/contrato";
import { validarEvento } from "@/lib/validation/evento";
import { validarServico } from "@/lib/validation/servico";
import { validarTarefaPadrao } from "@/lib/validation/tarefa-padrao";
import { validarUsuario, gerarSenhaTemporaria } from "@/lib/validation/usuario";

describe("validarCliente", () => {
  const valido = { nome: "Maria Silva", email: "maria@example.com", telefone: "(11) 99999-0000" };

  it("aceita entrada válida", () => {
    expect(validarCliente(valido)).toEqual({});
  });

  it("rejeita nome vazio", () => {
    expect(validarCliente({ ...valido, nome: "  " }).nome).toBeDefined();
  });

  it("rejeita nome com 1 caractere", () => {
    expect(validarCliente({ ...valido, nome: "A" }).nome).toBeDefined();
  });

  it("rejeita nome maior que 200 caracteres", () => {
    expect(validarCliente({ ...valido, nome: "A".repeat(201) }).nome).toBeDefined();
  });

  it("email vazio é aceito (campo opcional)", () => {
    expect(validarCliente({ ...valido, email: "" }).email).toBeUndefined();
  });

  it("rejeita email malformado", () => {
    expect(validarCliente({ ...valido, email: "não-é-email" }).email).toBeDefined();
  });

  it("telefone vazio é aceito (campo opcional)", () => {
    expect(validarCliente({ ...valido, telefone: "" }).telefone).toBeUndefined();
  });

  it("rejeita telefone com letras", () => {
    expect(validarCliente({ ...valido, telefone: "abc" }).telefone).toBeDefined();
  });
});

describe("validarContrato", () => {
  it("aceita evento e ao menos um serviço", () => {
    expect(validarContrato({ eventoId: "1", servicoIds: ["a"] })).toEqual({});
  });

  it("rejeita sem evento", () => {
    expect(validarContrato({ eventoId: "", servicoIds: ["a"] }).eventoId).toBeDefined();
  });

  it("rejeita sem nenhum serviço", () => {
    expect(validarContrato({ eventoId: "1", servicoIds: [] }).servicoIds).toBeDefined();
  });
});

describe("validarEvento", () => {
  const valido = { nome: "Casamento X", clienteId: "1", dataEvento: "2026-12-01", area: "noivas" };

  it("aceita entrada válida", () => {
    expect(validarEvento(valido)).toEqual({});
  });

  it("rejeita nome vazio", () => {
    expect(validarEvento({ ...valido, nome: "" }).nome).toBeDefined();
  });

  it("rejeita sem cliente", () => {
    expect(validarEvento({ ...valido, clienteId: "" }).clienteId).toBeDefined();
  });

  it("rejeita data inválida", () => {
    expect(validarEvento({ ...valido, dataEvento: "não-é-data" }).dataEvento).toBeDefined();
  });

  it("data vazia é aceita (campo opcional)", () => {
    expect(validarEvento({ ...valido, dataEvento: "" }).dataEvento).toBeUndefined();
  });

  it("rejeita área fora da lista", () => {
    expect(validarEvento({ ...valido, area: "outra" }).area).toBeDefined();
  });

  it("área vazia é aceita (campo opcional)", () => {
    expect(validarEvento({ ...valido, area: "" }).area).toBeUndefined();
  });
});

describe("validarServico", () => {
  it("aceita entrada válida", () => {
    expect(validarServico({ nome: "Buffet", descricao: "" })).toEqual({});
  });

  it("rejeita nome vazio", () => {
    expect(validarServico({ nome: "", descricao: "" }).nome).toBeDefined();
  });

  it("rejeita nome de 1 caractere", () => {
    expect(validarServico({ nome: "A", descricao: "" }).nome).toBeDefined();
  });

  it("rejeita descrição maior que 2000 caracteres", () => {
    expect(validarServico({ nome: "Buffet", descricao: "A".repeat(2001) }).descricao).toBeDefined();
  });
});

describe("validarTarefaPadrao", () => {
  const valido = {
    nome: "Confirmar fornecedor",
    descricao: "",
    responsavelPadraoId: "1",
    prazoOffsetDias: "-30",
    prioridade: "media",
    ordem: "1",
    visivelAoCliente: false,
  };

  it("aceita entrada válida", () => {
    expect(validarTarefaPadrao(valido)).toEqual({});
  });

  it("rejeita prioridade inválida", () => {
    expect(validarTarefaPadrao({ ...valido, prioridade: "urgente" }).prioridade).toBeDefined();
  });

  it("aceita prazoOffsetDias negativo (dias antes do evento)", () => {
    expect(validarTarefaPadrao({ ...valido, prazoOffsetDias: "-15" }).prazoOffsetDias).toBeUndefined();
  });

  it("rejeita prazoOffsetDias não numérico", () => {
    expect(validarTarefaPadrao({ ...valido, prazoOffsetDias: "abc" }).prazoOffsetDias).toBeDefined();
  });

  it("rejeita ordem negativa", () => {
    expect(validarTarefaPadrao({ ...valido, ordem: "-1" }).ordem).toBeDefined();
  });
});

describe("validarUsuario", () => {
  const valido = { nome: "João Pedro", email: "joao@example.com", perfil: "socio" };

  it("aceita entrada válida", () => {
    expect(validarUsuario(valido)).toEqual({});
  });

  it("rejeita email vazio (obrigatório, diferente de cliente)", () => {
    expect(validarUsuario({ ...valido, email: "" }).email).toBeDefined();
  });

  it("rejeita perfil fora da lista (ex.: 'cliente' não é cadastrável aqui)", () => {
    expect(validarUsuario({ ...valido, perfil: "cliente" }).perfil).toBeDefined();
  });
});

describe("gerarSenhaTemporaria", () => {
  it("gera string de 16 caracteres", () => {
    expect(gerarSenhaTemporaria()).toHaveLength(16);
  });

  it("gera valores diferentes a cada chamada", () => {
    const senhas = new Set(Array.from({ length: 20 }, () => gerarSenhaTemporaria()));
    expect(senhas.size).toBe(20);
  });
});
