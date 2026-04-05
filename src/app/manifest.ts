import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "리플라이 — AI 답장 도우미",
    short_name: "리플라이",
    description: "받은 메시지를 붙여넣으면 AI가 답장 3개를 만들어 드립니다",
    start_url: "/app",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
