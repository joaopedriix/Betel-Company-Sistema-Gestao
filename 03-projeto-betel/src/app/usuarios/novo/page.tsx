import { criarUsuario } from "../actions";
import { UsuarioForm } from "../usuario-form";

export default function NovoUsuarioPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Novo sócio/usuário</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Uma senha temporária será gerada e mostrada uma única vez após o
        cadastro — repasse ao usuário para o primeiro acesso.
      </p>
      <UsuarioForm
        action={criarUsuario}
        emailEditavel
        tituloBotao="Cadastrar usuário"
        cancelarHref="/usuarios"
      />
    </main>
  );
}
