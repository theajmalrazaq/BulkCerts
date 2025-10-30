import React from 'react'

export default function Button({ children, onClick, variant = 'default', className = '', ...props }){
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 font-medium transition-colors'
  const variants = {
    default: 'bg-[#FF2E00] text-white hover:brightness-95',
    outline: 'border-2 border-[#FF2E00] text-[#FF2E00] hover:bg-[#FF2E00] hover:text-white',
    ghost: 'bg-transparent text-white'
  }
  return (
    <button onClick={onClick} className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  )
}
