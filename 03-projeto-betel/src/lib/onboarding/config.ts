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
export const ONBOARDING_VERSAO = 1;

export const ONBOARDING_STEPS_POR_PERFIL: Record<Perfil, OnboardingStep[]> = {
  admin: [
    {
      id: "visao-geral",
      title: "Bem-vindo ao sistema da Betel",
      description:
        "Aqui você acompanha toda a operação: cadastros, contratos, eventos e o checklist de cada um. Este tour mostra rapidamente onde encontrar cada coisa — você pode pular ou refazer quando quiser.",
    },
    {
      id: "clientes",
      title: "Clientes",
      description: "Cadastre e gerencie os clientes da Betel.",
      href: "/clientes",
    },
    {
      id: "usuarios",
      title: "Sócios e usuários",
      description: "Gerencie quem tem acesso ao sistema e qual o perfil de cada pessoa.",
      href: "/usuarios",
    },
    {
      id: "servicos",
      title: "Serviços",
      description: "Cadastre os serviços oferecidos pela Betel.",
      href: "/servicos",
    },
    {
      id: "checklist",
      title: "Checklist por serviço",
      description:
        "Cada serviço pode ter um checklist padrão. Quando um contrato com esse serviço é fechado, as tarefas do checklist são geradas automaticamente para o evento.",
    },
    {
      id: "eventos",
      title: "Eventos",
      description: "Cadastre os eventos da Betel, vinculados a um cliente.",
      href: "/eventos",
    },
    {
      id: "contratos",
      title: "Contratos",
      description:
        "Um contrato liga um cliente, um evento e os serviços contratados. Fica em rascunho até você fechar.",
      href: "/contratos",
    },
    {
      id: "fechamento",
      title: "Fechamento do contrato",
      description:
        "Ao fechar um contrato, o sistema gera automaticamente as tarefas do checklist de cada serviço contratado, com prazo calculado a partir da data do evento. Depois de fechado, o contrato fica protegido contra alterações.",
    },
    {
      id: "tarefas",
      title: "Tarefas geradas",
      description:
        "As tarefas geradas aparecem para o responsável de cada uma em \"Minhas tarefas\", e você acompanha o progresso de cada evento pelo dashboard.",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      description:
        "Aqui você vê a visão geral: contratos em aberto e fechados, tarefas pendentes/atrasadas/concluídas, e o progresso de cada evento.",
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
