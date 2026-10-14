/** The iPhone hardware shell (bezel, side buttons, notch) filled edge-to-edge with a real app screenshot. */
export function PhoneShot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`relative mx-auto aspect-[9/19.3] w-full max-w-[340px] rounded-[3.4rem] p-[3px] shadow-[0_40px_120px_-20px_rgba(61,220,151,0.25)] ${className}`}
      style={{ background: "linear-gradient(155deg, #4a4e4c 0%, #1a1c1b 22%, #0a0b0a 60%, #38403c 100%)" }}
    >
      {/* side buttons */}
      <div className="absolute -left-[2px] top-24 h-6 w-[3px] rounded-l-full bg-[#2a2c2a]" />
      <div className="absolute -left-[2px] top-32 h-10 w-[3px] rounded-l-full bg-[#2a2c2a]" />
      <div className="absolute -left-[2px] top-[11.5rem] h-10 w-[3px] rounded-l-full bg-[#2a2c2a]" />
      <div className="absolute -right-[2px] top-28 h-16 w-[3px] rounded-r-full bg-[#2a2c2a]" />

      <div className="h-full rounded-[3.25rem] bg-black p-[6px]">
        <div className="relative h-full overflow-hidden rounded-[2.9rem] bg-[#07110d]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[26px] w-[94px] -translate-x-1/2 rounded-full bg-black ring-[0.5px] ring-white/10" />
        </div>
      </div>
    </div>
  );
}
