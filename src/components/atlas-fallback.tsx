export function AtlasFallback() {
  return (
    <svg className="atlas-fallback" viewBox="0 0 640 640" role="img" aria-label="Illustration of routes from Dhaka across the globe">
      <defs>
        <radialGradient id="planet-fill" cx="35%" cy="30%"><stop stopColor="#17584d" /><stop offset=".55" stopColor="#0a302d" /><stop offset="1" stopColor="#041713" /></radialGradient>
        <radialGradient id="planet-light"><stop stopColor="#f4d38d" stopOpacity=".9" /><stop offset="1" stopColor="#cfb57c" stopOpacity="0" /></radialGradient>
        <clipPath id="planet-clip"><circle cx="320" cy="320" r="249" /></clipPath>
      </defs>
      <circle cx="320" cy="320" r="255" fill="none" stroke="#b9d6c3" strokeOpacity=".34" strokeWidth="2" />
      <circle cx="320" cy="320" r="249" fill="url(#planet-fill)" />
      <g clipPath="url(#planet-clip)" fill="none" stroke="#a8c8aa" strokeOpacity=".18">
        <ellipse cx="320" cy="320" rx="94" ry="249" /><ellipse cx="320" cy="320" rx="184" ry="249" />
        <path d="M70 320h500M94 220h452M94 420h452M145 145h350M145 495h350" />
        <path d="M215 245q25-37 69-29l29 16 28-14 37 12-2 24 33 12-17 28-32 8-13 27-39-12-16 18-31-16-11-39-32-15zM398 324l21-19 27 4 14 25-18 22-25-2zM169 344l22-13 30 17 6 39-25 24-26-13z" fill="#376b54" fillOpacity=".28" stroke="none" />
      </g>
      <g fill="none" stroke="#cfb57c" strokeWidth="2" strokeOpacity=".85">
        <path d="M402 339Q348 227 224 250M402 339Q336 256 258 280M402 339Q381 298 406 355M402 339Q430 292 477 388M402 339Q436 309 503 415M402 339Q376 252 300 275M402 339Q452 245 504 289M402 339Q308 160 179 218" />
      </g>
      <circle cx="402" cy="339" r="37" fill="url(#planet-light)" />
      <g fill="#f1cf8e">
        <circle cx="402" cy="339" r="6" /><circle cx="224" cy="250" r="4" /><circle cx="258" cy="280" r="4" /><circle cx="406" cy="355" r="4" /><circle cx="477" cy="388" r="4" /><circle cx="503" cy="415" r="4" /><circle cx="300" cy="275" r="4" /><circle cx="504" cy="289" r="4" /><circle cx="179" cy="218" r="4" />
      </g>
      <text x="415" y="335" fill="#f3f0e7" fontSize="16" fontFamily="sans-serif">DAC</text>
    </svg>
  );
}
