import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Corporate Chinese Training - TLI Connect Business Solutions",
  description: "Transform your business with TLI Connect's corporate Chinese training programs. Build cross-cultural competence and unlock Asian markets with Taiwan's leading language institute.",
  keywords: "corporate Chinese training, business Mandarin, cross-cultural training, corporate language programs, TLI business solutions",
  openGraph: {
    title: "Corporate Chinese Training - TLI Connect Business Solutions",
    description: "Transform your business with TLI Connect's corporate Chinese training programs. Build cross-cultural competence and unlock Asian markets.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Chinese Training - TLI Connect Business Solutions",
    description: "Transform your business with TLI Connect's corporate Chinese training programs.",
  },
}

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}