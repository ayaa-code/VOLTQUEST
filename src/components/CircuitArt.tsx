export function CircuitArt({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`circuit-art ${compact ? 'compact' : ''}`}
      viewBox="0 0 400 300"
      fill="none"
      role="img"
      aria-label="Ilustrasi baterai yang menyalakan lampu dalam rangkaian tertutup"
    >
      <circle cx="201" cy="149" r="117" fill="#E8E3FC" />
      <circle cx="201" cy="149" r="91" stroke="#D6CDF7" strokeDasharray="3 8" />
      <path
        d="M120 110V84Q120 70 134 70H270Q286 70 286 86V110M286 175V220Q286 234 272 234H134Q120 234 120 220V185"
        stroke="#7664BE"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M144 70H171M286 197V215"
        stroke="#C3B5F2"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="86" y="110" width="68" height="91" rx="17" fill="#C7BAF0" />
      <rect x="86" y="110" width="68" height="31" rx="12" fill="#8B73CB" />
      <rect x="106" y="102" width="28" height="10" rx="4" fill="#665296" />
      <path
        d="M120 119V132M114 125H126M114 183H126"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M125 149L112 166H123L117 179L132 160H121L125 149Z"
        fill="#FFF3B1"
      />
      <circle cx="285" cy="129" r="49" fill="#FFF1B2" fillOpacity=".65" />
      <path
        d="M258 125C258 89 312 89 312 125C312 144 298 145 298 160H273C273 145 258 144 258 125Z"
        fill="#FFE48B"
        stroke="#D6AE52"
        strokeWidth="3"
      />
      <path
        d="M276 132L285 143L295 130M285 143V160"
        stroke="#BA8B3E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M273 162H298M275 169H296M279 176H292"
        stroke="#80738C"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M284 66V55M329 86L338 77M241 86L232 77M342 125H352"
        stroke="#DAB957"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="173"
        y="214"
        width="57"
        height="39"
        rx="12"
        fill="#FAF8FF"
        stroke="#C7B9ED"
        strokeWidth="2"
      />
      <circle cx="187" cy="234" r="4" fill="#8E78C9" />
      <circle cx="217" cy="234" r="4" fill="#8E78C9" />
      <path
        d="M188 234H216"
        stroke="#8E78C9"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="61" cy="90" r="6" fill="#B8DBD4" />
      <circle cx="336" cy="222" r="8" fill="#F6C5AC" />
      <path
        d="M67 208V220M61 214H73M192 30V42M186 36H198"
        stroke="#B9AED8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M48 145L39 158H47L43 169L57 153H48L48 145Z" fill="#B6A7DF" />
    </svg>
  )
}
