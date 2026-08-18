import type { Perfil } from "@/lib/auth/rotas";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

// Incrementar quando os passos mudarem de forma relevante: usuários que
// já completaram uma versão anterior veem o tour de novo automaticamente
// uma única vez (onboarding_versao < ONBOARDING_VERSAO), sem perder o
// "concluído" de quem já viu a versão atual.
export const ONBOARDING_VERSAO = 2;

export const ONBOARDING_STEPS_POR_PERFIL: Record<Perfil, OnboardingStep[]> = {
  admin: [
    {
      id: "visao-geral",
      title: "Bem-vindo ao sistema da Betel",
      description:
        "Aqui você acompanha toda a operação: cadastros, contratos, eventos e o checklist de cada um. Este tour mostra rapidamente onde encontrar cada coisa — você pode pular ou refazer quando quiser.",
    },
    {
      id: "cadastros",
      title: "Cadastros",
      description:
        "Clientes, sócios/usuários e serviços da Betel ficam no menu \"Cadastros\" — a base de tudo antes de criar eventos e contratos.",
      href: "/clientes",
    },
    {
      id: "checklist",
      title: "Checklist por serviço",
      description:
        "Cada serviço pode ter um checklist padrão. Quando um contrato com esse serviço é fechado, as tarefas do checklist são geradas automaticamente para o evento.",
    },
    {
      id: "eventos-contratos",
      title: "Eventos e contratos",
      description:
        "Cadastre o evento do cliente e depois o contrato, ligando cliente, evento e os serviços contratados. O contrato fica em rascunho até você fechar.",
      href: "/eventos",
    },
    {
      id: "fechamento",
      title: "Fechamento do contrato",
      description:
        "Ao fechar um contrato, o sistema gera automaticamente as tarefas do checklist de cada serviço contratado, com prazo calculado a partir da data do evento. Depois de fechado, o contrato fica protegido contra alterações.",
    },
    {
      id: "acompanhamento",
      title: "Acompanhamento",
      description:
        "As tarefas geradas aparecem para o responsável de cada uma; você acompanha o progresso de cada evento e a visão geral pelo Dashboard.",
      href: "/dashboard",
    },
  ],
  socio: [
    {
      id: "bem-vindo-socio",
      title: "Bem-vindo ao sistema da Betel",
      description:
        "Aqui você encontra as tarefas atribuídas a você em cada evento. Este tour mostra rapidamente como usar — você pode pular ou refazer quando quiser.",
    },
    {
      id: "minhas-tarefas",
      title: "Minhas tarefas",
      description:
        "Todas as tarefas atribuídas a você aparecem aqui, separadas em pendentes e concluídas.",
      href: "/minhas-tarefas",
    },
    {
      id: "detalhes-tarefa",
      title: "Detalhes da tarefa",
      description:
        "Cada tarefa mostra o evento relacionado, o prazo e a prioridade — assim você sabe o que priorizar.",
    },
    {
      id: "conclusao",
      title: "Concluindo uma tarefa",
      description:
        "Ao concluir uma tarefa, ela sai da lista de pendentes. Só um administrador pode reabrir uma tarefa já concluída.",
    },
    {
      id: "navegacao",
      title: "Navegação",
      description: "Use o menu lateral para voltar a \"Minhas tarefas\" a qualquer momento.",
    },
  ],
  // Portal do cliente ainda não foi implementado (stub "Em Construção") —
  // sem tour até a feature existir de fato.
  cliente: [],
};
