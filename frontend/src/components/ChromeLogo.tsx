export default function ChromeLogo() {
  return <svg className="chrome-logo" viewBox="55 290 1170 580" role="img" aria-label="Duc’s Backtester">
    <defs>
      <mask id="logo-lettering" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="1280" style={{ maskType: 'luminance' }}>
        <image href="/backtester-logo.png" width="1280" height="1280" />
      </mask>
      <linearGradient id="logo-chrome" x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" stopColor="#d7e2ee" />
        <stop offset=".25" stopColor="#7e8b99" />
        <stop offset=".43" stopColor="#f5f8fa" />
        <stop offset=".5" stopColor="#a9b8c9" />
        <stop offset=".54" stopColor="#556170" />
        <stop offset=".7" stopColor="#b6c4d0" />
        <stop offset=".85" stopColor="#f4eee0" />
        <stop offset="1" stopColor="#8995a2" />
      </linearGradient>
      <linearGradient id="logo-reflection">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity=".7" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g mask="url(#logo-lettering)">
      <rect x="55" y="290" width="1170" height="580" fill="url(#logo-chrome)" />
      <rect className="chrome-reflection" x="-400" y="280" width="300" height="600" fill="url(#logo-reflection)" />
    </g>
  </svg>
}
