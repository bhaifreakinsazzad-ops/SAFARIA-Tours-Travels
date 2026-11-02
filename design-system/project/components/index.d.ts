/** SAFARIA design system runtime: window.Safaria (plain JS, optional anime.js / Motion / three). */
export interface Destination { code: string; city: string; country: string; region: "domestic" | "international"; lat: number; lon: number; origin?: boolean; note?: string }
export interface ButtonProps { /** "gold" primary · "outline" secondary · "emerald" day-surface primary */ variant: "gold" | "outline" | "emerald"; label: string; disabled?: boolean; magnetic?: boolean }
export interface SectionHeadingProps { eyebrow: string; title: string; lead?: string; reveal?: boolean }
export interface HeaderProps { drawer?: HTMLElement; veil?: HTMLElement; scroller?: HTMLElement | Window }
export interface HeroGlobeProps { THREE?: unknown; distance?: number; offsetX?: number; caption?: string | false; destinations?: Destination[] }
export interface HeroGlobeHandle { focus(code: string): void; reset(): void; destroy(): void }
export interface ServiceListProps { items: { icon: string; title: string; line: string; href: string; primary?: boolean }[] }
export interface DestinationGridProps { region?: "all" | "domestic" | "international"; limit?: number; href?(d: Destination): string; onSelect?(code: string, e: MouseEvent): void }
export interface FlightQuoteData { trip: "One-way" | "Round-trip" | "Multi-city"; from: string; to: string; depart: string; ret: string; adults: number; children: number; infants: number; cabin: string; airline: string; baggage: string; name: string; phone: string; email: string; notes: string; source: string; time: string }
export interface FlightQuoteProps { source?: string; onStart?(): void; /** resolve only when your CRM really accepted the enquiry */ onSubmit?(q: FlightQuoteData, summary: string): Promise<unknown> }
export interface PricePlanProps { root: HTMLElement }
export interface AccordionProps { root: HTMLElement }
export interface ContactDockProps { quoteHref?: string }
export interface FooterProps { year?: number }
export interface MotionProps { root?: ParentNode }
export interface SafariaConfig { phone: string; email: string; source: string; respectSiteMotionToggle: boolean }
