import React, { useEffect, useState } from 'react'

export default function EmailModal(){
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')

  useEffect(()=>{
    // expose simple global handlers so legacy code and other components can open the modal
    window.showEmailModal = () => setOpen(true)
    window.hideEmailModal = () => setOpen(false)
    return () => {
      delete window.showEmailModal
      delete window.hideEmailModal
    }
  },[])

  async function handleSend(){
    try{
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text })
      })
      const data = await res.json()
      if(res.ok){
        // use notify if present
        window.notify && window.notify(data.message || 'Email sent!','check-circle')
        setOpen(false)
        setTo('')
        setSubject('')
        setText('')
      } else {
        window.notify && window.notify(data.error || 'Failed to send email','alert-circle')
      }
    }catch(err){
      console.error('email send', err)
      window.notify && window.notify(err.message || 'Error sending email','alert-circle')
    }
  }

  if(!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#0c0c0c] border-2 border-[#121212] rounded-md p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-3">Send Email</h3>
        <div className="space-y-3">
          <input value={to} onChange={e=>setTo(e.target.value)} placeholder="To (email)" className="w-full p-2 rounded bg-[#111] border border-[#222] text-white" />
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="w-full p-2 rounded bg-[#111] border border-[#222] text-white" />
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} className="w-full p-2 rounded bg-[#111] border border-[#222] text-white" placeholder="Message" />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={()=>setOpen(false)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
            <button onClick={handleSend} className="px-3 py-2 bg-[#fe2e00] rounded text-white">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
