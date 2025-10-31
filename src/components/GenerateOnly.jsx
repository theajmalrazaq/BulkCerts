import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import ThemeToggle from './ThemeToggle'
import { Slider } from './ui/slider'
import {Input} from './ui/input'

export default function GenerateOnly({ navigate }){
  const previewRef = useRef(null)
  const wrapperRef = useRef(null)
  const draggingRef = useRef({ active: false, offsetX: 0, offsetY: 0 })
  const [uploadedImage, setUploadedImage] = useState(null)
  const [names, setNames] = useState(['Demo Name'])
  const [previewName, setPreviewName] = useState('Demo Name')
  const [fontSize, setFontSize] = useState(40)
  const [color, setColor] = useState('#ffffff')
  const [textX, setTextX] = useState(100)
  const [textY, setTextY] = useState(200)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [textAlign, setTextAlign] = useState('center')
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Draw preview with correct scaling and high-resolution support.
  const drawPreview = useCallback(()=>{
    const canvas = previewRef.current
    if(!canvas || !uploadedImage) return

    const dpr = window.devicePixelRatio || 1
    // target drawing size = actual image size
    const imgW = uploadedImage.width
    const imgH = uploadedImage.height
    canvas.width = Math.round(imgW * dpr)
    canvas.height = Math.round(imgH * dpr)
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0,0,imgW,imgH)
    ctx.drawImage(uploadedImage,0,0, imgW, imgH)

    const style = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}`
    ctx.font = `${style}${fontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textAlign = textAlign
    const text = previewName || names[0] || 'Demo Name'
    ctx.fillText(text, textX, textY)
  },[uploadedImage,fontSize,color,previewName,names,textX,textY,fontFamily,bold,italic,textAlign])

  useEffect(()=>{ drawPreview() },[drawPreview])

  function handleImage(e){
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (ev)=>{
      const img = new Image()
      img.onload = ()=> {
        setUploadedImage(img)
        // center text defaults
        setTextX(Math.round(img.width/2))
        setTextY(Math.round(img.height/2 + 20))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function handleCSV(e){
    const f = e.target.files[0]
    if(!f) return
    const r = new FileReader()
    r.onload = (ev)=>{
      // support CSV or newline separated. Take first column if CSV.
      const text = ev.target.result
      const rows = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
      const parsed = rows.map(rw => {
        // if comma separated, take first cell
        const parts = rw.split(',')
        return parts[0].replace(/^\uFEFF/, '').trim()
      }).filter(Boolean)
      if(parsed.length) {
        setNames(parsed)
        setPreviewName(parsed[0])
      }
    }
    r.readAsText(f)
  }

  function saveImages(){
    if(!uploadedImage) return alert('Upload an image first')
    setSaving(true)
    setTimeout(()=>{
      try{
        const off = document.createElement('canvas')
        off.width = uploadedImage.width
        off.height = uploadedImage.height
        const ctx = off.getContext('2d')
        names.forEach((name, idx)=>{
          ctx.clearRect(0,0,off.width,off.height)
          ctx.drawImage(uploadedImage,0,0)
          const style = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}`
          ctx.font = `${style}${fontSize}px ${fontFamily}`
          ctx.fillStyle = color
          ctx.textAlign = textAlign
          ctx.fillText(name, textX, textY)
          const link = document.createElement('a')
          link.download = `${name}.png`
          link.href = off.toDataURL('image/png')
          link.click()
        })
      }finally{ setSaving(false) }
    }, 50)
  }

  function exportAsPDF(){
    if(!uploadedImage){ window.notify && window.notify('Upload image first','alert-circle'); return }
    // rely on jspdf being available on window (legacy) or skip
    if(typeof window.jspdf === 'undefined'){
      window.notify && window.notify('jsPDF not available (use CDN or install jspdf)','alert-circle')
      return
    }
    try{
      const jsPDF = window.jspdf && window.jspdf.jsPDF
      if(!jsPDF){ window.notify && window.notify('jsPDF not available','alert-circle'); return }
      const pdf = new jsPDF('l','px',[uploadedImage.width, uploadedImage.height])
      // draw each name onto a temp canvas and add as image to pdf
      names.forEach((name, idx)=>{
        const temp = document.createElement('canvas')
        temp.width = uploadedImage.width
        temp.height = uploadedImage.height
        const tctx = temp.getContext('2d')
        tctx.drawImage(uploadedImage,0,0)
        const style = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}`
        tctx.font = `${style}${fontSize}px ${fontFamily}`
        tctx.fillStyle = color
        tctx.textAlign = textAlign
        tctx.fillText(name, textX, textY)
        const imgData = temp.toDataURL('image/png')
        if(idx>0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, uploadedImage.width, uploadedImage.height)
      })
      pdf.save('certificates.pdf')
      window.notify && window.notify('PDF exported','check')
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
      const style = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}`
      tctx.font = `${style}${fontSize}px ${fontFamily}`
      tctx.fillStyle = color
      tctx.textAlign = textAlign
      tctx.fillText(name, textX, textY)
      const img = temp.toDataURL()
      printWindow.document.write(`<img src="${img}" style="width:100%;page-break-after:always"/>`)
    })
    printWindow.document.close()
    printWindow.focus()
    setTimeout(()=>{ printWindow.print(); printWindow.close() },300)
  }
  // Canvas interaction: allow dragging the preview text to reposition
  function getCanvasClientToImageScale(){
    const canvas = previewRef.current
    if(!canvas || !uploadedImage) return 1
    // canvas displayed width (CSS) vs image width
    const rect = canvas.getBoundingClientRect()
    return uploadedImage.width / rect.width
  }

  function handleCanvasPointerDown(e){
    if(!uploadedImage) return
    const canvas = previewRef.current
    const rect = canvas.getBoundingClientRect()
    const scale = getCanvasClientToImageScale()
    const clientX = e.clientX
    const clientY = e.clientY
    const imgX = (clientX - rect.left) * scale
    const imgY = (clientY - rect.top) * scale
    // measure text bounding rough area
    const approxWidth = (fontSize * (previewName.length || 8)) / 2
    const approxHeight = fontSize
    if(Math.abs(imgX - textX) < approxWidth && Math.abs(imgY - textY) < approxHeight){
      draggingRef.current.active = true
      draggingRef.current.offsetX = imgX - textX
      draggingRef.current.offsetY = imgY - textY
      window.addEventListener('pointermove', handleCanvasPointerMove)
      window.addEventListener('pointerup', handleCanvasPointerUp)
    }
  }

  function handleCanvasPointerMove(e){
    if(!draggingRef.current.active) return
    const canvas = previewRef.current
    const rect = canvas.getBoundingClientRect()
    const scale = getCanvasClientToImageScale()
    const imgX = (e.clientX - rect.left) * scale
    const imgY = (e.clientY - rect.top) * scale
    setTextX(Math.round(imgX - draggingRef.current.offsetX))
    setTextY(Math.round(imgY - draggingRef.current.offsetY))
  }

  function handleCanvasPointerUp(){
    draggingRef.current.active = false
    window.removeEventListener('pointermove', handleCanvasPointerMove)
    window.removeEventListener('pointerup', handleCanvasPointerUp)
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
              <Button variant="ghost" onClick={() => { if(step === 1){ navigate && navigate('home') } else { setStep(1) } }}>
                {step === 1 ? 'Back' : 'Back'}
              </Button>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground">Upload Certificate Image</label>
                  <Input type="file" accept="image/*" onChange={handleImage} aria-label="Upload certificate image" />
                  <div className="text-xs text-muted-foreground mt-1">PNG or JPG recommended. Click to select or drag image file onto the page.</div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground">Upload Names (CSV or TXT)</label>
                  <Input type="file" accept=".csv,.txt" onChange={handleCSV} aria-label="Upload names csv" />
                  <div className="text-xs text-muted-foreground mt-1">First column or each line will be used as a name.</div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => {
                    if(!uploadedImage){ window.notify && window.notify('Please upload an image first','alert-circle'); return }
                    if(!names || !names.length){ window.notify && window.notify('Please upload a names file','alert-circle'); return }
                    setStep(2)
                  }}>Next</Button>
                  <Button variant="ghost" className="w-20" onClick={() => navigate && navigate('home')}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Uploaded Image: {uploadedImage ? 'Yes' : 'No'} • Names: {names?.length || 0}</div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={saveImages} disabled={saving}>{saving ? 'Saving…' : 'Download'}</Button>
                  <Button variant="ghost" className="w-20" onClick={exportAsPDF}>PDF</Button>
                  <Button variant="ghost" className="w-20" onClick={printCertificates}>Print</Button>
                </div>
                <div>
                  <Button variant="ghost" onClick={() => setStep(1)}>Edit Uploads</Button>
                </div>
              </div>
            )}
          </aside>

          {step === 2 && (
            <main className="flex-1">
              <div className="rounded-2xl border p-4 bg-card flex gap-4 items-stretch">
              <div className="flex-1 flex flex-col">
                <div ref={wrapperRef} className="mb-4 overflow-auto flex items-center justify-center">
                  <canvas
                    ref={previewRef}
                    className="block w-full h-auto max-h-[70vh]"
                    style={{ width: '100%', height: 'auto', maxHeight: '70vh', touchAction: 'none', cursor: draggingRef.current.active ? 'grabbing' : 'crosshair' }}
                    onPointerDown={handleCanvasPointerDown}
                    aria-label="Certificate preview canvas"
                  />
                </div>

                {/* Bottom toolbar: quick editing controls */}
                <div className="flex items-center justify-between mt-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Align</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm rounded border bg-background hover:bg-muted" onClick={()=>{ setTextAlign('left'); if(uploadedImage) setTextX(50) }}>Left</button>
                      <button className="px-3 py-1 text-sm rounded border bg-background hover:bg-muted" onClick={()=>{ setTextAlign('center'); if(uploadedImage) setTextX(uploadedImage.width/2) }}>Center</button>
                      <button className="px-3 py-1 text-sm rounded border bg-background hover:bg-muted" onClick={()=>{ setTextAlign('right'); if(uploadedImage) setTextX(uploadedImage.width - 50) }}>Right</button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Size</label>
                    <button className="px-3 py-1 text-sm rounded border bg-background hover:bg-muted" onClick={()=> setFontSize(s=>s+2)}>A+</button>
                    <button className="px-3 py-1 text-sm rounded border bg-background hover:bg-muted" onClick={()=> setFontSize(s=>Math.max(10,s-2))}>A-</button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Preview Name</label>
                    <input className="p-1 rounded border" value={previewName} onChange={e=>{ setPreviewName(e.target.value); }} />
                  </div>
                </div>
              </div>

              {/* Right-side edit panel */}
              <aside className="w-72 shrink-0 flex flex-col">
                <div className="mb-2 font-medium">Edit Options</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground">Font Family</label>
                    <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)} className="w-full mt-1 p-2 rounded border bg-background">
                      <option>Arial</option>
                      <option>Times New Roman</option>
                      <option>Georgia</option>
                      <option>Courier New</option>
                      <option>Verdana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground">Text Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={e=>setColor(e.target.value)}
                      className="w-full h-8 p-0 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground">Font Size</label>
                    <div className="mt-2">
                      <Slider
                        min={10}
                        max={120}
                        value={[fontSize]}
                        onValueChange={(val) => setFontSize(Number(val?.[0] ?? fontSize))}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{fontSize}px</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Style</label>
                    <button className={`px-3 py-1 rounded border ${bold ? 'bg-muted' : 'bg-background'}`} onClick={()=>setBold(b=>!b)}>{bold ? 'Bold ✓' : 'Bold'}</button>
                    <button className={`px-3 py-1 rounded border ${italic ? 'bg-muted' : 'bg-background'}`} onClick={()=>setItalic(i=>!i)}>{italic ? 'Italic ✓' : 'Italic'}</button>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground">Text X</label>
                    <Input type="number" value={textX} onChange={e=>setTextX(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground">Text Y</label>
                    <Input type="number" value={textY} onChange={e=>setTextY(Number(e.target.value))} />
                  </div>
                </div>
              </aside>
            </div>
          </main>
          )}
        </div>
      </div>
    </div>
  )
}
