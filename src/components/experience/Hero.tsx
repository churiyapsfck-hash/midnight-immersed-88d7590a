import { Countdown } from "./Countdown";

/**
 * White editorial hero — this is the post-reload page the project was using:
 * clean white stage, compressed centered title, blurred shadow mass, and the
 * countdown sitting directly beneath the venue lockup.
 */
function MachinedTitle() {
  const chars = "ILLUMINATI".split("");
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] h-24 w-[72%] -translate-x-1/2 rounded-[50%] blur-3xl md:h-32"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 42%, rgba(0,0,0,0) 72%)",
        }}
      />
      <h1 className="relative flex flex-wrap justify-center font-[Anton] text-[clamp(3.5rem,10.4vw,8.9rem)] leading-[0.78] tracking-normal">
        {chars.map((c, i) => (
          <span
            key={i}
            className="relative inline-block"
            style={{
              color: "transparent",
              background:
                "linear-gradient(180deg, #202024 0%, #3b3b42 20%, #08080a 52%, #67676e 64%, #16161a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextStroke: "0.5px rgba(0,0,0,0.12)",
              textShadow:
                "0 1px 0 #111, 0 2px 0 #050505, 0 14px 24px rgba(0,0,0,0.28), 0 28px 38px rgba(0,0,0,0.18)",
            }}
          >
            {c}
          </span>
        ))}
        {/* Version tag — blood red machined 3.0 */}
        <span
          className="relative ml-2 inline-block md:ml-3"
          style={{
            color: "transparent",
            background:
              "linear-gradient(180deg, #e7b7bb 0%, #a50710 28%, #540006 58%, #bd101d 76%, #210002 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow:
              "0 1px 0 #420006, 0 2px 0 #210003, 0 14px 24px rgba(0,0,0,0.24), 0 0 28px rgba(160,0,10,0.18)",
          }}
        >
          3.0
        </span>
      </h1>

    </div>
  );
}

export function Hero() {
  const target = new Date(Date.now() + 27 * 86400000 + 14 * 3600000 + 33 * 60000);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-white text-black">
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-px bg-black md:block" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center px-6 pb-8 pt-24 text-center md:px-10 md:pt-28">
        <div className="font-mono text-[8px] uppercase tracking-[0.48em] text-black/45 md:text-[9px]">
          © ILLUMINATI 3.0
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8 md:py-10">
          <MachinedTitle />

          <div className="mx-auto mt-5 flex flex-col items-center gap-2 md:mt-7">
            <div className="font-[Anton] text-[clamp(1.35rem,3.2vw,2.55rem)] leading-none tracking-[0.24em] text-black md:tracking-[0.3em]">
              MARQUEE CLUB AND KITCHEN
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.48em] text-black/45 md:text-xs">
              AUG 3
            </div>
            <div className="mt-4 flex flex-col items-center gap-1 md:mt-5">
              <div
                className="font-[Anton] leading-none tracking-[0.18em]"
               style={{
                  fontSize: "clamp(1.2rem, 2.6vw, 2.05rem)",
                  color: "transparent",
                  background:
                    "linear-gradient(180deg, #55555a 0%, #151518 54%, #4b4b50 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 10px 20px rgba(0,0,0,0.18)",
                }}
              >
                IRONOAK
              </div>
            </div>
          </div>

          <div className="mt-8 w-full md:mt-10">
          <Countdown target={target} />
          </div>
        </div>

        <a
          href="#tickets"
          className="group inline-flex items-center gap-3 rounded-full border border-black/15 bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          <span>ENTER</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
        </a>
      </div>
    </section>
  );
}