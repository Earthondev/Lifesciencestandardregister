'use client'

import React from 'react'

interface ChemicalBackgroundProps {
  children: React.ReactNode
}

export default function ChemicalBackground({ children }: ChemicalBackgroundProps) {
  const chemicalNames = [
    'Dioxane', 'Benzene', 'Vitamin B1', 'Vitamin D3', 'Ethanol',
    'Methanol', 'Acetone', 'Toluene', 'Chloroform', 'Hexane',
    'Pentane', 'Butanol', 'Propanol', 'Isopropanol', 'Ethylene',
    'Propylene', 'Butylene', 'Styrene', 'Phenol', 'Aniline',
    'Pyridine', 'Thiophene', 'Furan', 'Pyrrole', 'Imidazole',
    'Benzaldehyde', 'Acetophenone', 'Benzyl Alcohol', 'Cinnamaldehyde', 'Vanillin',
    'Caffeine', 'Nicotine', 'Morphine', 'Codeine', 'Aspirin',
    'Ibuprofen', 'Paracetamol', 'Penicillin', 'Streptomycin', 'Tetracycline'
  ]

  const pillShapes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    width: Math.random() * 100 + 50,
    height: Math.random() * 30 + 20,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 20
  }))

  return (
    <div className="chemical-background">
      {/* Chemical Elements */}
      <div className="chemical-elements">
        {chemicalNames.map((name, index) => (
          <div
            key={index}
            className="chemical-element"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              fontSize: `${Math.random() * 0.8 + 0.8}rem`
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Pill Shapes */}
      <div className="chemical-elements">
        {pillShapes.map((pill) => (
          <div
            key={pill.id}
            className="pill-shape"
            style={{
              width: `${pill.width}px`,
              height: `${pill.height}px`,
              top: `${pill.top}%`,
              left: `${pill.left}%`,
              animationDelay: `${pill.delay}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
