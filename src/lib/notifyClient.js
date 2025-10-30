// Small DOM-based notification helper compatible with legacy code
export default function notify(message, icon){
  try{
    const notification = document.createElement('div')
    notification.className = 'fixed bottom-4 right-4 bg-black border border-white/10 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 z-50 flex items-center gap-2'
    notification.innerHTML = `\n    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>\n    <span>${message}</span>\n  `
    document.body.appendChild(notification)
    setTimeout(()=>{ notification.classList.add('translate-y-full','opacity-0'); setTimeout(()=>notification.remove(),300)},3000)
  }catch(err){ console.error('notify error', err) }
}

// Also expose as window.notify for code that expects it
if(typeof window !== 'undefined') window.notify = notify

export { notify }
