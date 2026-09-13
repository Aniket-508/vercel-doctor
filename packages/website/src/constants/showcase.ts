export interface ShowcaseProject {
  description: string;
  githubRepository: string;
  logoUrl: string;
  name: string;
  websiteUrl: string;
}

export interface ShowcaseProjectWithStars extends ShowcaseProject {
  stars: number | null;
}

export const GITHUB_STARS_REVALIDATE_SECONDS = 3600;
export const SHOWCASE_LOGO_SIZE_PX = 24;

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    description:
      "Type-safe search params state management for React frameworks.",
    githubRepository: "47ng/nuqs",
    logoUrl: "https://nuqs.dev/icon.svg",
    name: "nuqs",
    websiteUrl: "https://nuqs.dev",
  },
  {
    description:
      "Open-source icon library for designers and developers across modern frameworks.",
    githubRepository: "dqev/reicon",
    logoUrl: "https://reicon.dev/favicon.svg",
    name: "Reicon",
    websiteUrl: "https://reicon.dev",
  },
  {
    description: "QR menu platform for restaurants and cafés.",
    githubRepository: "dkast/biztro",
    logoUrl: "https://biztro.co/logo-bistro.svg",
    name: "Biztro",
    websiteUrl: "https://biztro.co",
  },
  {
    description:
      "Free, self-hosted Instagram comment-to-DM automation using the Meta API.",
    githubRepository: "Xeven777/openinstadm",
    logoUrl: "https://openinstadm.vercel.app/icon0.svg",
    name: "OpenInstaDM",
    websiteUrl: "https://openinstadm.vercel.app",
  },
  {
    description: "Comprehensive census of coding agent harnesses.",
    githubRepository: "prime-radiant-inc/alltheagents.org",
    logoUrl: "https://avatars.githubusercontent.com/u/253595997?v=4",
    name: "All The Agents",
    websiteUrl: "https://alltheagents.org",
  },
  {
    description:
      "Turn public websites into installable design contracts and reusable tokens.",
    githubRepository: "byronwade/designcontracts.sh",
    logoUrl: "https://designcontracts.sh/icon.svg",
    name: "Design Contracts",
    websiteUrl: "https://designcontracts.sh",
  },
  {
    description:
      "Modern React and Tailwind CSS components for accessible web applications.",
    githubRepository: "Dinil-Thilakarathne/sona-ui",
    logoUrl:
      "https://raw.githubusercontent.com/Dinil-Thilakarathne/sona-ui/master/public/apple-touch-icon.png",
    name: "Sona UI",
    websiteUrl: "https://sonaui.com",
  },
  {
    description:
      "Open-source icon library with more than 900 icons in five styles.",
    githubRepository: "Nexvyn/runeicons",
    logoUrl: "https://www.runeicons.com/icon",
    name: "Rune Icons",
    websiteUrl: "https://runeicons.com",
  },
  {
    description:
      "ASCII-framed React diagrams designed for Markdown and shadcn projects.",
    githubRepository: "keshav-exe/markdown-graphs",
    logoUrl: "https://mdx-graphs.kshv.me/icon.svg",
    name: "Markdown Graphs",
    websiteUrl: "https://mdx-graphs.kshv.me",
  },
  {
    description:
      "Open-source shadcn/ui component registries and tools for React.",
    githubRepository: "shadcn-labs/shadcn-labs.com",
    logoUrl: "https://www.shadcn-labs.com/favicon.svg",
    name: "Shadcn Labs",
    websiteUrl: "https://www.shadcn-labs.com",
  },
  {
    description:
      "shadcn/ui registry template with docs, a landing page, and agent support.",
    githubRepository: "shadcn-labs/startercn",
    logoUrl: "https://startercn.vercel.app/favicon.svg",
    name: "startercn",
    websiteUrl: "https://startercn.vercel.app",
  },
  {
    description: "Terminal UI components for React, built on Ink and OpenTUI.",
    githubRepository: "shadcn-labs/termcn",
    logoUrl: "https://www.termcn.dev/favicon.svg",
    name: "termcn",
    websiteUrl: "https://termcn.dev",
  },
  {
    description: "Video components for React, built on Editframe.",
    githubRepository: "shadcn-labs/framecn",
    logoUrl: "https://www.framecn.dev/favicon.svg",
    name: "framecn",
    websiteUrl: "https://framecn.dev",
  },
  {
    description: "Open Graph image components for React, built on Satori.",
    githubRepository: "shadcn-labs/ogimagecn",
    logoUrl: "https://www.ogimagecn.com/favicon.svg",
    name: "ogimagecn",
    websiteUrl: "https://ogimagecn.com",
  },
  {
    description:
      "Customizable, production-ready AI agent recipes built on Eve and Flue.",
    githubRepository: "shadcn-labs/agentcn",
    logoUrl: "https://www.agentcn.run/favicon.svg",
    name: "agentcn",
    websiteUrl: "https://agentcn.run",
  },
  {
    description: "CSS-in-JS port of shadcn/ui, built on StyleX.",
    githubRepository: "shadcn-labs/shadcn-cssinjs",
    logoUrl: "https://www.shadcn-cssinjs.com/favicon.svg",
    name: "shadcn-cssinjs",
    websiteUrl: "https://shadcn-cssinjs.com",
  },
  {
    description: "ChatGPT, Claude, and MCP app UI components for React.",
    githubRepository: "shadcn-labs/mcpcn",
    logoUrl: "https://www.mcpcn.dev/favicon.svg",
    name: "mcpcn",
    websiteUrl: "https://mcpcn.dev",
  },
  {
    description: "Email components for React Email, MJML React, and JSX Email.",
    githubRepository: "shadcn-labs/emailcn",
    logoUrl: "https://www.emailcn.run/favicon.svg",
    name: "emailcn",
    websiteUrl: "https://emailcn.run",
  },
  {
    description: "PDF components for React, built on Takumi and Forme.",
    githubRepository: "shadcn-labs/pdfcn",
    logoUrl: "https://www.pdfcn.dev/favicon.svg",
    name: "pdfcn",
    websiteUrl: "https://pdfcn.dev",
  },
  {
    description: "Rich text editor components for React, built on Tiptap.",
    githubRepository: "shadcn-labs/editorcn",
    logoUrl: "https://editorcn.vercel.app/favicon.svg",
    name: "editorcn",
    websiteUrl: "https://editorcn.vercel.app",
  },
  {
    description: "Shader components for React, built on vgpu and TypeGPU.",
    githubRepository: "shadcn-labs/shadercn",
    logoUrl: "https://www.shadercn.run/favicon.svg",
    name: "shadercn",
    websiteUrl: "https://shadercn.run",
  },
];
