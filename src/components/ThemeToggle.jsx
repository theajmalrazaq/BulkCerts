import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'

function getStoredTheme(){
  try{
    return localStorage.getItem('theme')
  }catch(e){ return null }
}

function setDOMTheme(theme){
  const el = document.documentElement
  if(theme === 'dark') el.classList.add('dark')
  else el.classList.remove('dark')
}

export default function ThemeToggle(){
  const [theme, setTheme] = useState(()=> getStoredTheme() || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

  useEffect(()=>{
    setDOMTheme(theme)
    try{ localStorage.setItem('theme', theme) }catch(e){}
  },[theme])

  return (
    <Button variant="ghost" aria-label="Toggle theme" onClick={()=>setTheme(t => t === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export { getStoredTheme, setDOMTheme }
