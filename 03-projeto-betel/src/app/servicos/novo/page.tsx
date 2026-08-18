import { criarServico } from "../actions";
import { ServicoForm } from "../servico-form";

export default function NovoServicoPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Novo serviço</h1>
      <ServicoForm
        action={criarServico}
        tituloBotao="Salvar serviço"
        cancelarHref="/servicos"
      />
    </main>
  );
}
