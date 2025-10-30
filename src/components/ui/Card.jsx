import React from 'react'

export default function Card({ children, className='' }){
  return (
    <div className={`p-4 rounded-2xl border-2 border-[#121212] bg-[#0c0c0c] ${className}`}>
      {children}
    </div>
  )
}
