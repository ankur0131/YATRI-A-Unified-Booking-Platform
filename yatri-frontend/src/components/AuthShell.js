import { motion } from "framer-motion";
import { Sparkles, SunMoon } from "lucide-react";

function AuthShell({ theme, onToggleTheme, eyebrow, title, subtitle, sideNote = [], children, footer }) {
  const isLight = theme === "light";

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="ambient-orb left-[-8rem] top-[-6rem] h-64 w-64 bg-[#FF9933]/35" />
      <div className="ambient-orb bottom-[-10rem] right-[-4rem] h-80 w-80 bg-[#FFC107]/20" />
      <div className="noise-mask" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/20 lg:flex-row">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-8 sm:px-8 lg:px-10"
        >
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl saffron-gradient font-display text-base font-bold text-neutral-950">
                  Y
                </div>
                <div>
                  <p className="font-display text-sm font-semibold tracking-[0.32em]">YATRI</p>
                  <p className="text-xs text-white/60">Premium access</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15"
              >
                <SunMoon className="h-4 w-4" />
                {isLight ? "Dark mode" : "Light mode"}
              </button>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#FFE1BF]">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </div>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/70">{subtitle}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {sideNote.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-xl"
              >
                <p className="font-display text-2xl font-semibold">{item.value}</p>
                <p className="mt-2 text-sm text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="flex w-full items-center justify-center bg-gradient-to-br from-black/10 via-black/0 to-[#FF9933]/10 px-4 py-8 sm:px-6 lg:max-w-[34rem] lg:px-8"
        >
          <div className={`w-full rounded-[28px] p-6 sm:p-8 ${isLight ? "glass-card-light text-neutral-900" : "glass-card text-white"}`}>
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default AuthShell;
