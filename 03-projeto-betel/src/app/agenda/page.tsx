import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { LABEL_AREA_NEGOCIO, type AreaNegocio } from "@/lib/validation/evento";

type View = "dia" | "mes" | "ano";

type EventoRow = {
  id: string;
  nome: string;
  data_evento: string | null;
  area: AreaNegocio | null;
  cliente: { nome: string; telefone: string | null } | null;
};

const COR_AREA: Record<AreaNegocio, string> = {
  noivas: "#d4a62a",
  eventos: "#5279d6",
  decoracoes: "#4f9b69",
  estudio: "#8a62c3",
};

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Sempre via construtor (ano, mês, dia) em vez de parsear a string ISO
// direto — evita o clássico bug de fuso horário onde "2026-08-18" vira
// 17/08 dependendo do timezone do processo.
function parseISO(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const NOMES_DIA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; data?: string }>;
}) {
  const params = await searchParams;
  const view: View = params.view === "dia" || params.view === "ano" ? params.view : "mes";
  const dataRef = params.data && /^\d{4}-\d{2}-\d{2}$/.test(params.data)
    ? parseISO(params.data)
    : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const supabase = await createClient();

  // Busca a janela de datas mais ampla possível (o ano inteiro) de uma vez
  // só — os três modos filtram o mesmo conjunto em memória, evitando 3
  // formatos de query diferentes para manter.
  const inicioAno = formatISO(new Date(dataRef.getFullYear(), 0, 1));
  const fimAno = formatISO(new Date(dataRef.getFullYear(), 11, 31));

  const { data: eventosData } = await supabase
    .from("evento")
    .select("id, nome, data_evento, area, cliente:cliente_id(nome, telefone)")
    .gte("data_evento", inicioAno)
    .lte("data_evento", fimAno)
    .order("data_evento", { ascending: true });

  const eventos = (eventosData ?? []) as unknown as EventoRow[];

  const eventosPorDia = new Map<string, EventoRow[]>();
  for (const ev of eventos) {
    if (!ev.data_evento) continue;
    const lista = eventosPorDia.get(ev.data_evento) ?? [];
    lista.push(ev);
    eventosPorDia.set(ev.data_evento, lista);
  }

  function hrefPara(v: View, d: Date) {
    return `/agenda?view=${v}&data=${formatISO(d)}`;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <div className="flex gap-1 rounded-lg border p-1 text-sm">
          {(["dia", "mes", "ano"] as const).map((v) => (
            <Link
              key={v}
              href={hrefPara(v, dataRef)}
              className={`rounded-md px-3 py-1 ${
                view === v ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {v === "dia" ? "Diário" : v === "mes" ? "Mensal" : "Anual"}
            </Link>
          ))}
        </div>
      </div>

      {view === "dia" ? (
        <VisaoDia dataRef={dataRef} eventosPorDia={eventosPorDia} hrefPara={hrefPara} />
      ) : view === "mes" ? (
        <VisaoMes dataRef={dataRef} eventosPorDia={eventosPorDia} hrefPara={hrefPara} />
      ) : (
        <VisaoAno dataRef={dataRef} eventosPorDia={eventosPorDia} hrefPara={hrefPara} />
      )}
    </main>
  );
}

function VisaoDia({
  dataRef,
  eventosPorDia,
  hrefPara,
}: {
  dataRef: Date;
  eventosPorDia: Map<string, EventoRow[]>;
  hrefPara: (v: View, d: Date) => string;
}) {
  const iso = formatISO(dataRef);
  const eventosDoDia = eventosPorDia.get(iso) ?? [];
  const anterior = new Date(dataRef);
  anterior.setDate(anterior.getDate() - 1);
  const proximo = new Date(dataRef);
  proximo.setDate(proximo.getDate() + 1);

  return (
    <section className="flex flex-col gap-4">
      <Navegacao
        titulo={`${NOMES_DIA_SEMANA[dataRef.getDay()]}, ${dataRef.getDate()} de ${NOMES_MES[dataRef.getMonth()]} de ${dataRef.getFullYear()}`}
        hrefAnterior={hrefPara("dia", anterior)}
        hrefProximo={hrefPara("dia", proximo)}
      />
      {eventosDoDia.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum evento neste dia.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {eventosDoDia.map((ev) => {
            const telefone = ev.cliente?.telefone?.replace(/\D/g, "") ?? "";
            return (
              <li
                key={ev.id}
                className="rounded-lg border p-3 text-sm"
                style={{ borderLeftColor: ev.area ? COR_AREA[ev.area] : undefined, borderLeftWidth: ev.area ? 4 : undefined }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/eventos/${ev.id}`} className="font-medium hover:underline">
                    {ev.nome}
                  </Link>
                  {ev.area ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: COR_AREA[ev.area] }}
                    >
                      {LABEL_AREA_NEGOCIO[ev.area]}
                    </span>
                  ) : null}
                </div>
                {ev.cliente ? (
                  <p className="text-muted-foreground">
                    {ev.cliente.nome}
                    {telefone ? (
                      <>
                        {" · "}
                        <a
                          href={`https://wa.me/55${telefone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4"
                        >
                          WhatsApp
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function VisaoMes({
  dataRef,
  eventosPorDia,
  hrefPara,
}: {
  dataRef: Date;
  eventosPorDia: Map<string, EventoRow[]>;
  hrefPara: (v: View, d: Date) => string;
}) {
  const ano = dataRef.getFullYear();
  const mes = dataRef.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const inicioGrid = new Date(primeiroDia);
  inicioGrid.setDate(inicioGrid.getDate() - primeiroDia.getDay());

  const dias: Date[] = [];
  const cursor = new Date(inicioGrid);
  while (dias.length < 42) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const anterior = new Date(ano, mes - 1, 1);
  const proximo = new Date(ano, mes + 1, 1);
  const hoje = new Date();

  return (
    <section className="flex flex-col gap-4">
      <Navegacao
        titulo={`${NOMES_MES[mes]} de ${ano}`}
        hrefAnterior={hrefPara("mes", anterior)}
        hrefProximo={hrefPara("mes", proximo)}
      />
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {NOMES_DIA_SEMANA.map((n) => (
          <div key={n}>{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((d) => {
          const iso = formatISO(d);
          const eventosDoDia = eventosPorDia.get(iso) ?? [];
          const foraDoMes = d.getMonth() !== mes;
          const ehHoje = formatISO(d) === formatISO(hoje);
          return (
            <Link
              key={iso}
              href={hrefPara("dia", d)}
              className={`flex min-h-16 flex-col gap-1 rounded-lg border p-1.5 text-xs ${
                foraDoMes ? "text-muted-foreground/50" : ""
              } ${ehHoje ? "border-primary" : ""} hover:bg-accent/50`}
            >
              <span className={ehHoje ? "font-semibold" : ""}>{d.getDate()}</span>
              {eventosDoDia.slice(0, 2).map((ev) => (
                <span
                  key={ev.id}
                  className={`truncate rounded px-1 py-0.5 ${
                    ev.area ? "text-white" : "bg-accent text-accent-foreground"
                  }`}
                  style={ev.area ? { backgroundColor: COR_AREA[ev.area] } : undefined}
                >
                  {ev.nome}
                </span>
              ))}
              {eventosDoDia.length > 2 ? (
                <span className="text-muted-foreground">+{eventosDoDia.length - 2}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function VisaoAno({
  dataRef,
  eventosPorDia,
  hrefPara,
}: {
  dataRef: Date;
  eventosPorDia: Map<string, EventoRow[]>;
  hrefPara: (v: View, d: Date) => string;
}) {
  const ano = dataRef.getFullYear();
  const contagemPorMes = Array.from({ length: 12 }, () => 0);
  for (const iso of eventosPorDia.keys()) {
    const [y, m] = iso.split("-").map(Number);
    if (y === ano) contagemPorMes[m - 1] += eventosPorDia.get(iso)!.length;
  }

  const anterior = new Date(ano - 1, dataRef.getMonth(), 1);
  const proximo = new Date(ano + 1, dataRef.getMonth(), 1);

  return (
    <section className="flex flex-col gap-4">
      <Navegacao
        titulo={`${ano}`}
        hrefAnterior={hrefPara("ano", anterior)}
        hrefProximo={hrefPara("ano", proximo)}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NOMES_MES.map((nome, i) => (
          <Link
            key={nome}
            href={hrefPara("mes", new Date(ano, i, 1))}
            className="flex flex-col gap-1 rounded-lg border p-4 hover:bg-accent/50"
          >
            <span className="font-medium">{nome}</span>
            <span className="text-sm text-muted-foreground">
              {contagemPorMes[i] === 0
                ? "Nenhum evento"
                : `${contagemPorMes[i]} evento${contagemPorMes[i] > 1 ? "s" : ""}`}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Navegacao({
  titulo,
  hrefAnterior,
  hrefProximo,
}: {
  titulo: string;
  hrefAnterior: string;
  hrefProximo: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link href={hrefAnterior} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent/50">
        ← Anterior
      </Link>
      <h2 className="text-lg font-medium">{titulo}</h2>
      <Link href={hrefProximo} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent/50">
        Próximo →
      </Link>
    </div>
  );
}
