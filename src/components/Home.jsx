import React from 'react'
import Button from './ui/Button'

export default function Home({ navigate }){
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#0c0c0c] text-white">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex items-center justify-between p-3 rounded-3xl border-2 border-[#121212] bg-[#0c0c0c]">
          <div className="flex items-center gap-4">
            <img src="/Public/assest/logo.svg" alt="logo" className="h-9" />
            <h1 className="text-lg font-bold">CertEdit</h1>
          </div>
          <div>
            <a href="https://github.com/theajmalrazaq/certedit" target="_blank" rel="noreferrer" className="text-white">GitHub</a>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl text-center">
        <img src="/Public/assest/ertedit.svg" className="mx-auto h-40 mb-4" alt="certedit" />
        <h2 className="text-2xl font-bold mb-2">CertEdit - Bulk Certificate Generator</h2>
        <p className="text-gray-400 mb-6">Create and send professional certificates in bulk—zero hassle, all flex.</p>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={()=>navigate('generate-send')}>Generate & Send Certificates</Button>
          <Button variant="outline" onClick={()=>navigate('generate-only')}>Generate Only</Button>
        </div>
      </main>
    </div>
  )
}
