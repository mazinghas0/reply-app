import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-white">리플라이</span>
      </div>
      <SignIn
        fallbackRedirectUrl="/app"
        appearance={{
          variables: {
            colorBackground: "#0f172a",
            colorInputBackground: "#1e293b",
            colorInputText: "#f8fafc",
            colorText: "#f8fafc",
            colorTextSecondary: "#94a3b8",
            colorPrimary: "#0d9488",
            colorNeutral: "#f8fafc",
          },
          elements: {
            rootBox: "w-full max-w-md",
            card: "border border-slate-800 shadow-2xl",
            socialButtonsBlockButton: "border-slate-700 hover:bg-slate-700",
            formButtonPrimary: "bg-teal-600 hover:bg-teal-700",
            footerActionLink: "text-teal-400 hover:text-teal-300",
            dividerLine: "bg-slate-700",
            dividerText: "text-slate-500",
            identityPreviewEditButton: "text-teal-400",
          },
        }}
      />
      <p className="mt-6 text-sm text-slate-500">
        로그인하면 하루 10회까지 무료로 사용할 수 있어요
      </p>
    </div>
  );
}
