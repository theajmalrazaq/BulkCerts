import React from 'react'
import { Button } from './ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './ui/card'
import ThemeToggle from './ThemeToggle'

const features = [
  {
    title: 'CSV-driven',
    desc: 'Upload a CSV with recipient details and map fields to your template.',
  },
  {
    title: 'Custom Templates',
    desc: 'Design certificates with placeholders and brand them for your organization.',
  },
  {
    title: 'Email Delivery',
    desc: 'Automatically send generated certificates to recipients via email.',
  },
]

export default function Home({ navigate }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <img src="/Public/assest/logo.svg" alt="logo" className="h-9" />
            <h1 className="text-xl font-semibold">BulkCerts</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/theajmalrazaq/BulkCerts" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground">GitHub</a>
            <ThemeToggle />
          </div>
        </header>

        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">Create and send professional certificates at scale.</h2>
            <p className="text-muted-foreground mb-6">BulkCerts helps teams generate beautiful certificates from templates, merge recipient data, and deliver them by email with minimal effort.</p>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('generate-send')} className="shadow-sm">Generate & Send</Button>
              <Button variant="outline" onClick={() => navigate('generate-only')}>Generate Only</Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
              <div>Trusted by small teams and event organizers.</div>
              <div className="hidden sm:block">•</div>
              <div>No-code templates • CSV import • Email delivery</div>
            </div>
          </div>

          <div>
            <Card>
              <CardContent>
                <img src="/Public/assest/ertedit.svg" alt="bulkcerts" className="w-full h-56 object-contain" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">How it works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-sm text-muted-foreground">
          <div className="mb-2">Need help? Open an issue on <a href="https://github.com/theajmalrazaq/BulkCerts" target="_blank" rel="noreferrer" className="underline">GitHub</a>.</div>
          <div>v1.0 — Built with ❤️</div>
        </footer>
      </div>
    </div>
  )
}
