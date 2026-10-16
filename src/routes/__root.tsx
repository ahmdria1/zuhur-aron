import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LocaleProvider } from "@/lib/aron/locale";
import { Shell } from "@/components/aron/shell";
import appCss from "../styles.css?url";

const DESCRIPTION =
  "زهور أرون، استوديو تنسيق في بريدة. باقات وورد موسمي وأوركيد ومجفف، مع توصيل داخل القصيم وإلى مدن المملكة.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "زهور أرون | تنسيق الزهور في بريدة" },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Ahmed Al-Omrani" },
      { name: "theme-color", content: "#1e3a32" },
      { property: "og:title", content: "زهور أرون | تنسيق الزهور في بريدة" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og.jpg" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_SA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "زهور أرون" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "/og.jpg" },
      ...(import.meta.env.PROD
        ? [
            {
              httpEquiv: "Content-Security-Policy",
              content:
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
            },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "sitemap", href: "/sitemap.xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LocaleProvider>
            <Shell>
              <Outlet />
            </Shell>
          </LocaleProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
