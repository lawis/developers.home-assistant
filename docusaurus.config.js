module.exports = {
  title: "Home Assistant 开发者文档",
  tagline: "您需要的开发文档都在这里",
  url: "https://developers.home-assistant.io",
  baseUrl: "/",
  favicon: "img/favicon.png",
  organizationName: "home-assistant",
  projectName: "developers.home-assistant",
  themeConfig: {
    navbar: {
      title: "HA开发者",
      logo: {
        alt: "Home Assistant",
        src: "img/logo-pretty.svg",
        srcDark: "img/logo-pretty.svg",
      },
      items: [
        {
          label: "Home Assistant",
          position: "left",
          items: [
            {
              label: "概述",
              to: "docs/architecture_index",
            },
            {
              label: "内核(Core)",
              to: "docs/development_index",
            },
            { to: "docs/frontend", label: "前端(Frontend)" },
            { to: "docs/supervisor", label: "Supervisor" },
            { to: "docs/add-ons", label: "插件(Add-ons)" },
            { to: "docs/operating-system", label: "操作系统(Operating System)" },
            { to: "docs/voice/overview", label: "语音助手(Voice)" },
            { to: "docs/translations", label: "翻译指南(Translations)" },
          ],
        },
        { to: "docs/misc", label: "杂项", position: "left" },
        { to: "blog", label: "博客", position: "left" },
      ],
    },
    footer: {
      logo: {
        alt: "Home Assistant",
        src: "img/logo-white.svg",
        height: "70px",
        href: "https://www.home-assistant.io",
      },
      style: "dark",
      links: [
        {
          title: "更多",
          items: [
            {
              label: "首页",
              href: "https://www.home-assistant.io",
            },
            {
              label: "数据分析主页",
              href: "https://data.home-assistant.io",
            },
            {
              label: "重要通知",
              href: "https://alerts.home-assistant.io",
            },
            {
              label: "运行状态",
              href: "https://status.home-assistant.io/",
            },
          ],
        },
        {
          title: "社交",
          items: [
            {
              label: "博客",
              to: "blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/home-assistant",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/hass_devs",
            },
            {
              label: "Discord chat",
              href: "https://www.home-assistant.io/join-chat",
            },
          ],
        },
        {
          title: "其他",
          items: [
            {
              label: "隐私",
              href: "https://www.home-assistant.io/privacy/",
            },
            {
              label: "安全",
              href: "https://www.home-assistant.io/security/",
            },
          ],
        },
        {
          title: "鸣谢",
          items: [
            {
              html: `
              <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                <img src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg" alt="Deploys by Netlify" />
              </a>
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Home Assistant. Built with Docusaurus.`,
    },
    image: "img/default-social.png",
    mermaid: {
      theme: { light: "neutral", dark: "forest" },
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/home-assistant/developers.home-assistant/edit/master/",
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        blog: {
          postsPerPage: 10,
          feedOptions: {
            type: "all",
          },
        },
        googleAnalytics: {
          trackingID: "UA-57927901-3",
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
};
