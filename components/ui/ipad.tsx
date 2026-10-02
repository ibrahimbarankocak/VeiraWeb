import type { ReactNode, SVGProps } from "react";
import { cn } from "../../lib/utils";

// Chrome only (no built-in <image>) — adapted from https://www.eldoraui.site/docs/components/ipad
// so the screen area can host live React content instead of a single static image.
export function IpadChrome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="520" height="400" viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="#aaabac"
        d="M479.04,14.14H88.14v-.59c0-.16-.13-.3-.3-.3h-16.7c-.16,0-.3.13-.3.3v.59h-3.46v-.59c0-.16-.13-.3-.3-.3h-16.7c-.16,0-.3.13-.3.3v.59h-9.13c-13.4,0-24.27,10.78-24.45,24.14h-.48c-.16,0-.3.13-.3.3v20.07c0,.16.13.3.3.3h.47v303.38c0,13.51,10.95,24.45,24.45,24.45h438.08c13.51,0,24.45-10.95,24.45-24.45V38.6c0-13.51-10.95-24.45-24.45-24.45Z"
      />
      <rect fill="#000" x="18.58" y="15.94" width="482.84" height="368.91" rx="23.29" ry="23.29" />
      <rect fill="currentColor" x="31.37" y="28.47" width="457.25" height="342.87" rx="9.61" ry="9.61" />
      <circle fill="#0a1054" cx="245.1" cy="22.23" r="2.44" />
      <circle fill="#333" cx="274.98" cy="22.23" r=".88" />
    </svg>
  );
}

// Screen rect from the source SVG (viewBox 520x400), as fractions of the frame — used to position
// live HTML content precisely inside the glass instead of baking a static image into the SVG.
const SCREEN = { left: 31.37 / 520, top: 28.47 / 400, width: 457.25 / 520, height: 342.87 / 400 };

export function IpadFrame({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto aspect-[520/400] w-full", className)}>
      <IpadChrome className="absolute inset-0 h-full w-full text-[#07110d]" />
      <div
        className="absolute overflow-hidden rounded-[1.8%] bg-[#07110d]"
        style={{
          left: `${SCREEN.left * 100}%`,
          top: `${SCREEN.top * 100}%`,
          width: `${SCREEN.width * 100}%`,
          height: `${SCREEN.height * 100}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
