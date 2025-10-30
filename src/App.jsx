import React, { useState } from 'react'
import Home from './components/Home'
import GenerateOnly from './components/GenerateOnly'
import GenerateAndSend from './components/GenerateAndSend'
import EmailModal from './components/EmailModal'
import { notify } from './lib/notifyClient'

export default function App(){
  const [page, setPage] = useState('home')
  function navigate(p){ setPage(p) }
  return (
    <div>
      {page === 'home' && <Home navigate={navigate} />}
      {page === 'generate-only' && <GenerateOnly />}
      {page === 'generate-send' && <GenerateAndSend />}
      <EmailModal />
      {/* expose notify to window for legacy compatibility */}
      <script dangerouslySetInnerHTML={{__html: `window.notify = ${notify.toString()}`}} />
    </div>
  )
}
