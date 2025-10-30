import React from 'react'

export default function Input(props){
  return (
    <input
      {...props}
      className={`px-3 py-2 rounded-lg bg-[#0c0c0c] border-2 border-[#121212] text-white ${props.className||''}`}
    />
  )
}
