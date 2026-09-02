import { PlatformsPage } from "@/pages/PlatformPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/platforms")({
  head: () => ({
    meta: [
      { title: "Plataformas — Identity Access Admin" },
      {
        name: "description",
        content: "Lista e gestão de todas as plataformas ligadas à identidade central.",
      },
    ],
  }),
  component: PlatformsPage,
});
