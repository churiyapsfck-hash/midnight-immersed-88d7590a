import { useState } from "react";
import { ClientOnly } from "@/components/experience/ClientOnly";
import { ReloadIntro } from "@/components/experience/ReloadIntro";
import { AuthPanel } from "@/components/experience/AuthPanel";
import { ProfileSetupForm } from "@/components/experience/ProfileSetupForm";
import { CredentialsCard } from "@/components/experience/CredentialsCard";
import { BookingForm } from "@/components/experience/BookingForm";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { useAuth } from "@/hooks/useAuth";

export function ReservePage({ passType }: { passType: "standard" | "vip" }) {
  const { user, profile, loading, setProfile } = useAuth();
  const [showCreds, setShowCreds] = useState<{ userCode: string; password: string | null } | null>(null);
  const redirect = `/${passType}`;
  return (
    <main className="relative min-h-screen bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.35 0.22 25 / 0.35), transparent 60%), radial-gradient(ellipse at bottom, oklch(0.2 0.15 25 / 0.25), transparent 55%)",
        }}
      />
      <ClientOnly>
        <SmoothScroll />
        <ReloadIntro>
          <div className="relative flex min-h-screen items-center justify-center px-6 py-24">
            {loading ? (
              <div className="font-mono text-[11px] tracking-[0.4em] text-white/40">LOADING…</div>
            ) : !user ? (
              <AuthPanel redirectTo={redirect} />
            ) : showCreds ? (
              <CredentialsCard
                userCode={showCreds.userCode}
                password={showCreds.password}
                onContinue={() => setShowCreds(null)}
              />
            ) : !profile ? (
              <ProfileSetupForm
                userId={user.id}
                onDone={({ userCode, password, fullName, phone }) => {
                  setProfile({ id: user.id, user_code: userCode, full_name: fullName, phone });
                  setShowCreds({ userCode, password });
                }}
              />
            ) : (
              <BookingForm passType={passType} userId={user.id} profile={profile} />
            )}
          </div>
        </ReloadIntro>
      </ClientOnly>
    </main>
  );
}