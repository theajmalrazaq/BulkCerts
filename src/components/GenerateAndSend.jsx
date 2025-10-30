import React, { useRef, useState, useEffect } from 'react'
import Button from './ui/Button'

export default function GenerateAndSend(){
  const previewRef = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [names, setNames] = useState(['Demo Name'])
  const [fontSize, setFontSize] = useState(40)
  const [color, setColor] = useState('#ffffff')
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailText, setEmailText] = useState('')

  useEffect(()=>{
    if(!uploadedImage) return
    const canvas = previewRef.current
    canvas.width = uploadedImage.width
    canvas.height = uploadedImage.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(uploadedImage,0,0)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.fillText(names[0]||'Demo Name', 100, 200)
  },[uploadedImage,fontSize,color,names])

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

  async function sendEmailsAndGenerate(){
    if(!uploadedImage) return alert('Upload an image first')
    // For each name create an image and send via backend
    const off = document.createElement('canvas')
    off.width = uploadedImage.width
    off.height = uploadedImage.height
    const ctx = off.getContext('2d')
    for(const name of names){
      ctx.clearRect(0,0,off.width,off.height)
      ctx.drawImage(uploadedImage,0,0)
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = color
      ctx.fillText(name, 100, 200)
      const dataUrl = off.toDataURL()
      // Send email with image data (backend should accept base64 image)
      try{
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: emailTo, subject: emailSubject, text: emailText, name, image: dataUrl })
        })
        if(!res.ok) console.error('email error', await res.text())
      }catch(err){
        console.error('send error', err)
      }
    }
    alert('Done sending (attempted)')
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
      tctx.fillText(name, 100, 200)
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
        <div className="w-80">
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Upload Certificate Image</label>
            <input type="file" accept="image/*" onChange={handleImage} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Upload Names CSV</label>
            <input type="file" accept=".csv,.txt" onChange={handleCSV} />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400">To (email)</label>
            <input className="w-full p-2 rounded bg-[#111] border border-[#222]" value={emailTo} onChange={e=>setEmailTo(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Subject</label>
            <input className="w-full p-2 rounded bg-[#111] border border-[#222]" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400">Message</label>
            <textarea className="w-full p-2 rounded bg-[#111] border border-[#222]" value={emailText} onChange={e=>setEmailText(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={sendEmailsAndGenerate}>Send</Button>
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
