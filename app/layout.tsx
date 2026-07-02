import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokyoStay Property CMS",
  description: "A lightweight property presentation and publishing system for TokyoStay."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root{--ink:#171412;--mist:#f6f4ef;--line:#e7e1d7;--brand:#b8462f;--moss:#62715e;--night:#202733}
              body{margin:0;background:var(--mist);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Noto Sans JP",sans-serif}
              a{color:inherit;text-decoration:none}
              button,input,textarea,select{font:inherit}
              img{max-width:100%;display:block}
              .glass-nav{background:rgba(246,244,239,.86);backdrop-filter:blur(18px)}
              .shadow-card{box-shadow:0 10px 30px rgba(32,39,51,.08)}
              .shadow-soft{box-shadow:0 20px 60px rgba(23,20,18,.10)}
              .bg-mist{background:var(--mist)}
              .bg-ink{background:var(--ink)}
              .text-ink{color:var(--ink)}
              .text-white{color:#fff}
              .border-line{border-color:var(--line)}
              .ring-line{--tw-ring-color:var(--line)}
              .action-btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;padding:8px 14px;font-size:14px;font-weight:700;background:#fff;color:var(--ink)}
              .input{width:100%;border-radius:16px;border:1px solid var(--line);background:#fff;padding:11px 13px;color:var(--ink);outline:none}
              body>div.min-h-screen{min-height:100vh;background:var(--mist);color:var(--ink)}
              body>div.min-h-screen>header{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--line);background:rgba(255,255,255,.92);backdrop-filter:blur(18px)}
              body>div.min-h-screen>header>div{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px;flex-wrap:wrap}
              body>div.min-h-screen>main{display:grid;grid-template-columns:300px minmax(560px,1fr) 420px;min-height:calc(100vh - 64px)}
              body>div.min-h-screen>main>aside,body>div.min-h-screen>main>section{padding:20px}
              body>div.min-h-screen>main>aside{background:#fff;border-right:1px solid var(--line)}
              body>div.min-h-screen>main>aside:last-child{border-left:1px solid var(--line);border-right:0}
              body>div.min-h-screen section[class*="rounded"],body>div.min-h-screen div[class*="rounded-[28px]"]{border-radius:28px}
              body>div.min-h-screen section[class*="bg-white"],body>div.min-h-screen div[class*="bg-white"]{background:#fff}
              body>div.min-h-screen button{cursor:pointer}
              body>div.min-h-screen button:not(.action-btn){border-radius:14px;border:1px solid var(--line);padding:8px 12px;background:#fff}
              body>div.min-h-screen input,body>div.min-h-screen textarea,body>div.min-h-screen select{border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:#fff}
              main>header.glass-nav>div,main header.glass-nav>div{max-width:1280px;margin:0 auto;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
              main section{max-width:1280px;margin-left:auto;margin-right:auto}
              @media(max-width:1024px){
                body>div.min-h-screen>main{display:block}
                body>div.min-h-screen>main>aside{border-left:0;border-right:0;border-bottom:1px solid var(--line)}
              }
              @media(max-width:640px){
                body>div.min-h-screen>header>div{align-items:flex-start}
                body>div.min-h-screen>main>aside,body>div.min-h-screen>main>section{padding:14px}
              }
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
