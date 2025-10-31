import React, { useRef, useState, useEffect } from 'react'
import { Button } from './ui/button'
import ThemeToggle from './ThemeToggle'
import { Slider } from './ui/slider'
import {Input} from './ui/input'

export default function GenerateOnly({ navigate }){
  const previewRef = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [names, setNames] = useState(['Demo Name'])
  const [fontSize, setFontSize] = useState(40)
  const [color, setColor] = useState('#ffffff')
  const [textX, setTextX] = useState(100)
  const [textY, setTextY] = useState(200)

  useEffect(()=>{
    if(!uploadedImage) return
    const canvas = previewRef.current
    canvas.width = uploadedImage.width
    canvas.height = uploadedImage.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(uploadedImage,0,0)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.fillText(names[0]||'Demo Name', textX, textY)
  },[uploadedImage,fontSize,color,names,textX,textY])

  function handleImage(e){
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (ev)=>{
      const img = new Image()
      img.onload = ()=> setUploadedImage(img)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function handleCSV(e){
    const f = e.target.files[0]
    if(!f) return
    const r = new FileReader()
    r.onload = (ev)=>{
      const lines = ev.target.result.split('\n').map(l=>l.trim()).filter(Boolean)
      if(lines.length) setNames(lines)
    }
    r.readAsText(f)
  }

  function saveImages(){
    if(!uploadedImage) return alert('Upload an image first')
    const off = document.createElement('canvas')
    off.width = uploadedImage.width
    off.height = uploadedImage.height
    const ctx = off.getContext('2d')
    names.forEach(name=>{
      ctx.clearRect(0,0,off.width,off.height)
      ctx.drawImage(uploadedImage,0,0)
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = color
      ctx.fillText(name, textX, textY)
      const link = document.createElement('a')
      link.download = `${name}.png`
      link.href = off.toDataURL()
      link.click()
    })
  }

  function exportAsPDF(){
    if(!uploadedImage){ window.notify && window.notify('Upload image first','alert-circle'); return }
    // rely on jspdf being available on window (legacy) or skip
    if(typeof window.jspdf === 'undefined' && typeof window.jspdf === 'undefined'){
      window.notify && window.notify('jsPDF not available (use CDN or install jspdf)','alert-circle')
      return
    }
    try{
      // try using global jspdf if present
      const jsPDF = window.jspdf && window.jspdf.jsPDF
      if(!jsPDF){ window.notify && window.notify('jsPDF not available','alert-circle'); return }
      const pdf = new jsPDF('l','px',[uploadedImage.width, uploadedImage.height])
      names.forEach((name, idx)=>{
        if(idx>0) pdf.addPage()
        ctx.clearRect(0,0,off.width,off.height)
      })
      window.notify && window.notify('PDF export not fully implemented in this build','clock')
    }catch(err){ console.error(err); window.notify && window.notify('PDF export failed','alert-circle') }
  }

  function printCertificates(){
    if(!uploadedImage){ window.notify && window.notify('Upload image first','alert-circle'); return }
    const printWindow = window.open('','_blank')
    names.forEach((name)=>{
      const temp = document.createElement('canvas')
      temp.width = uploadedImage.width
      temp.height = uploadedImage.height
      const tctx = temp.getContext('2d')
      tctx.drawImage(uploadedImage,0,0)
      tctx.font = `${fontSize}px Arial`
      tctx.fillStyle = color
      tctx.fillText(name, textX, textY)
      const img = temp.toDataURL()
      printWindow.document.write(`<img src="${img}" style="width:100%;page-break-after:always"/>`)
    })
    printWindow.document.close()
    printWindow.focus()
    setTimeout(()=>{ printWindow.print(); printWindow.close() },300)
  }

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <img src="/Public/assest/logo.svg" alt="logo" className="h-8" />
            <h1 className="text-lg font-semibold">BulkCerts</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/theajmalrazaq/BulkCerts" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground">GitHub</a>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex gap-6">
          <aside className="w-72">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Generate Only</div>
              <Button variant="ghost" onClick={() => navigate && navigate('home')}>Back</Button>
            </div>

            <div className="mb-4">
              <Input label="Upload Certificate Image" accept="image/*" onChange={handleImage} />
            </div>
            <div className="mb-4">
              <Input label="Upload Names CSV" accept=".csv,.txt" onChange={handleCSV} />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400">Text Color</label>
              <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400">Font Size</label>
              {/* Radix Slider expects value as an array (range support). Provide single-value array and use onValueChange. */}
              <Slider
                min={10}
                max={120}
                value={[fontSize]}
                onValueChange={(val) => setFontSize(Number(val?.[0] ?? fontSize))}
              />
              <div className="text-sm text-gray-400">{fontSize}px</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400">Text X</label>
              <Input type="number" value={textX} onChange={e=>setTextX(Number(e.target.value))} />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400">Text Y</label>
              <Input type="number" value={textY} onChange={e=>setTextY(Number(e.target.value))} />
            </div>

            <div className="flex gap-2 mb-6">
              <Button onClick={saveImages}>Download</Button>
              <Button variant="ghost" onClick={exportAsPDF}>PDF</Button>
              <Button variant="ghost" onClick={printCertificates}>Print</Button>
            </div>

            <div className="rounded-md border p-3 bg-card">
              <h4 className="font-medium mb-2">Key features</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Bulk generation from spreadsheet</li>
                <li>Personalize certificates with dynamic fields</li>
                <li>Export as PDF or PNG</li>
                <li>Preview before download</li>
                <li>Print or email generated files</li>
              </ul>
            </div>
          </aside>

          <main className="flex-1">
            <div className="rounded-2xl border p-4 bg-card">
              <canvas ref={previewRef} className="w-full max-h-[70vh]" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
