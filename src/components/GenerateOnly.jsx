import React, { useRef, useState, useEffect } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'

export default function GenerateOnly(){
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
    <div className="min-h-screen p-6 bg-[#0c0c0c] text-white">
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="w-72">
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Upload Certificate Image</label>
            <input type="file" accept="image/*" onChange={handleImage} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Upload Names CSV</label>
            <input type="file" accept=".csv,.txt" onChange={handleCSV} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Text Color</label>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Font Size</label>
            <input type="range" min="10" max="120" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} />
            <div className="text-sm text-gray-400">{fontSize}px</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveImages}>Download</Button>
            <Button variant="ghost" onClick={exportAsPDF}>PDF</Button>
            <Button variant="ghost" onClick={printCertificates}>Print</Button>
          </div>
        </div>

        <div className="flex-1">
          <div className="border-2 border-[#121212] rounded-2xl p-4">
            <canvas ref={previewRef} className="w-full max-h-[70vh]" />
          </div>
        </div>
      </div>
    </div>
  )
}
