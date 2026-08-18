import { EmConstrucao } from "@/components/em-construcao";
import { LogoutButton } from "@/components/logout-button";

export default function Page() {
  return (
    <div>
      <div className="flex justify-end p-4">
        <LogoutButton />
      </div>
      <EmConstrucao titulo="Dashboard" />
    </div>
  );
}
