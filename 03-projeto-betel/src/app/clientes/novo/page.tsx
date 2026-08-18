import { criarCliente } from "../actions";
import { ClienteForm } from "../cliente-form";

export default function NovoClientePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Novo cliente</h1>
      <ClienteForm
        action={criarCliente}
        tituloBotao="Salvar cliente"
        cancelarHref="/clientes"
      />
    </main>
  );
}
