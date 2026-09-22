import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, ChevronLeft, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { translate } from "../lib/locale";

type Language = "en" | "hi";

const occupations = ["Student", "Designer", "Developer", "Founder", "Writer / Creator", "Teacher / Educator", "Researcher", "Other"] as const;
const useCases = ["Work", "Study", "Personal notes", "Project planning", "Journaling", "Writing & ideas", "Other"] as const;

export function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || "");
  const [language, setLanguage] = useState<Language>(user?.language === "hi" ? "hi" : "en");
  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [useCase, setUseCase] = useState(user?.useCase || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const t = useMemo(() => (key: string) => translate(key, language), [language]);

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }
  if (user.onboardingCompleted === true) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!name.trim()) {
        setError(t("Please enter your name."));
        return;
      }
      setStep(2);
      return;
    }
    if (!occupation) {
      setError(t("Please select your role."));
      return;
    }
    if (!useCase) {
      setError(t("Please select a use case."));
      return;
    }
    setStep(3);
  };

  const complete = async () => {
    if (!user.token || isSaving) return;
    setError("");
    setIsSaving(true);
    try {
      const response = await api.completeOnboarding(user.token, name.trim(), language, occupation, useCase);
      if (!response.success) {
        setError(response.message || t("Unable to complete onboarding. Please try again."));
        return;
      }
      updateUser({
        name: response.name || name.trim(),
        onboardingCompleted: true,
        language: response.language || language,
        occupation: response.occupation || occupation,
        useCase: response.useCase || useCase,
      });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || t("Unable to complete onboarding. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-surface-subtle text-text-primary">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-action-primary text-sm font-semibold text-text-inverse">N</div>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">NotePad</span>
          </div>
          <div className="text-xs text-text-muted">{t("Step")} {step} {t("of")} 3</div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-12">
          <div className="w-full max-w-[560px]">
            <div className="mb-8 flex gap-2">
              {[1, 2, 3].map((item) => <div key={item} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${item <= step ? "bg-action-primary" : "bg-surface-hover"}`} />)}
            </div>

            <AnimatePresence mode="wait">
              <motion.section key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="rounded-[28px] border border-border-default bg-surface p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-10">
                {step === 1 && <StepOne t={t} name={name} setName={setName} avatarUrl={user.avatarUrl} email={user.email} />}
                {step === 2 && <StepTwo t={t} language={language} setLanguage={setLanguage} occupation={occupation} setOccupation={setOccupation} useCase={useCase} setUseCase={setUseCase} />}
                {step === 3 && <StepThree t={t} />}
                {error && <div className="mt-5 rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-hover">{error}</div>}
                <div className="mt-9 flex items-center justify-between gap-3">
                  {step > 1 ? <button type="button" onClick={() => { setError(""); setStep(step - 1); }} disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"><ChevronLeft className="h-4 w-4" />{t("Back")}</button> : <span />}
                  {step < 3 ? <button type="button" onClick={nextStep} className="inline-flex h-11 items-center gap-2 rounded-xl bg-action-primary px-5 text-sm font-medium text-text-inverse transition-all hover:bg-action-primary-hover">{t("Continue")}<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={complete} disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-action-primary px-5 text-sm font-medium text-text-inverse transition-all hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? t("Saving...") : t("Start Writing")}{!isSaving && <ArrowRight className="h-4 w-4" />}</button>}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function StepOne({ t, name, setName, avatarUrl, email }: any) {
  return <div>
    <div className="mb-8"><p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-text-muted">01</p><h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[36px]">{t("Welcome to NotePad")}</h1><p className="mt-3 max-w-[470px] text-sm leading-6 text-text-secondary">{t("Let’s set up your workspace")}</p><p className="mt-1 max-w-[470px] text-sm leading-6 text-text-muted">{t("Tell us a little about yourself so we can personalize NotePad for you.")}</p></div>
    <div className="mb-7 flex items-center gap-4 rounded-2xl border border-border-default bg-surface-subtle p-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface text-text-secondary">{avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <UserCircle2 className="h-7 w-7" strokeWidth={1.5} />}</div><div className="min-w-0"><p className="text-sm font-medium text-text-primary">{t("Profile photo")}</p><p className="mt-1 truncate text-xs text-text-muted">{email}</p></div></div>
    <label className="block"><span className="mb-2 block text-sm font-medium text-icon-primary">{t("Your name")}</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Enter your name")} className="h-12 w-full rounded-xl border border-border-default bg-surface px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-border-focus" /></label>
  </div>;
}

function StepTwo({ t, language, setLanguage, occupation, setOccupation, useCase, setUseCase }: any) {
  return <div>
    <div className="mb-8"><p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-text-muted">02</p><h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[36px]">{t("Personal Preferences")}</h1><p className="mt-3 max-w-[470px] text-sm leading-6 text-text-secondary">{t("Choose what fits you best. You can change some preferences later.")}</p></div>
    <div className="space-y-5">
      <SelectField label={t("Language")} value={language} onChange={(v: string) => setLanguage(v === "hi" ? "hi" : "en")}><option value="en">{t("English")}</option><option value="hi">{t("Hindi")}</option></SelectField>
      <SelectField label={t("What do you do?")} placeholder={t("Select your role")} value={occupation} onChange={setOccupation}>{occupations.map((item) => <option key={item} value={item}>{t(item)}</option>)}</SelectField>
      <SelectField label={t("What will you use NotePad for?")} placeholder={t("Select a use case")} value={useCase} onChange={setUseCase}>{useCases.map((item) => <option key={item} value={item}>{t(item)}</option>)}</SelectField>
    </div>
  </div>;
}

function SelectField({ label, placeholder, value, onChange, children }: any) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-icon-primary">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-border-default bg-surface px-4 text-sm text-text-primary outline-none transition-colors focus:border-border-focus">{placeholder && <option value="" disabled>{placeholder}</option>}{children}</select></label>;
}

function StepThree({ t }: { t: (key: string) => string }) {
  return <div className="py-5 text-center sm:py-8"><div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-[20px] bg-action-primary text-text-inverse shadow-[0_12px_30px_rgba(0,0,0,0.14)]"><Check className="h-7 w-7" strokeWidth={2.2} /></div><p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-text-muted">03</p><h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[36px]">{t("Everything you need")}</h1><p className="mx-auto mt-4 max-w-[450px] text-sm leading-6 text-text-secondary">{t("Your workspace is ready. Capture ideas, organize notes, and keep everything in one place.")}</p></div>;
}
