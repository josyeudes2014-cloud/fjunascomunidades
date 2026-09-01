export function FjuLogo({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox='0 0 100 100' className={`${className} drop-shadow-lg`} aria-hidden='true'>
      <path d='M50 2 L96 28 L96 72 L50 98 L4 72 L4 28 Z' fill='#16a34a' stroke='#facc15' strokeWidth='4' />
      <path d='M50 10 L90 33 L90 67 L50 90 L10 67 L10 33 Z' fill='none' stroke='#ffffff' strokeWidth='2' strokeOpacity='0.5' />
      <text x='50' y='44' textAnchor='middle' fill='#ffffff' fontSize='22' fontWeight='900' fontFamily='sans-serif'>FJU</text>
      <text x='50' y='60' textAnchor='middle' fill='#fde047' fontSize='9' fontWeight='700' fontFamily='sans-serif'>NAS</text>
      <text x='50' y='71' textAnchor='middle' fill='#fde047' fontSize='8' fontWeight='700' fontFamily='sans-serif'>COMUNIDADES</text>
    </svg>
  );
}
