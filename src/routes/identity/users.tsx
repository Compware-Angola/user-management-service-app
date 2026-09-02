import { UsersPage } from "@/pages/UserPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/identity/users")({
  head: () => ({
    meta: [
      { title: "Utilizadores — Identity Access Admin" },
      {
        name: "description",
        content: "Lista e gestão de todos os utilizadores registados na identidade central.",
      },
    ],
  }),
  component: UsersPage,
});
