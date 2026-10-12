// Original SVG stand-ins, deliberately temporary until T007 character production.
export function Portrait({ character }: { character: 'bell' | 'luna' }) {
  const isBell = character === 'bell';
  return <svg className={`portrait ${character}`} viewBox="0 0 180 235" role="img" aria-label={isBell ? 'ベル：白黒のボーダーコリー少年（仮立ち絵）' : 'ルナ：赤いリボンの灰銀オオカミ娘（仮立ち絵）'}>
    <path d="M14 235Q15 169 53 158L127 158Q165 175 168 235" fill={isBell ? '#1a2c44' : '#24314a'} stroke="#c1a16b" strokeWidth="2" />
    <path d="M57 169L90 195L123 169L117 235H63Z" fill="#e8ddd0" />
    <path d="M44 91L27 27L72 55M106 54L153 18L139 105" fill={isBell ? '#293240' : '#99a4b6'} stroke="#d2c5b1" strokeWidth="2" />
    {isBell ? <path d="M27 27L30 66L50 48Z" fill="#e0d8ce" /> : <path d="M35 42L43 76L60 57M119 60L145 34L137 86" fill="#d9b4b6" />}
    <path d="M39 108Q32 55 84 49Q139 43 145 101L139 153Q122 185 90 185Q58 182 43 151Z" fill="#e7cbb9" />
    <path d="M37 117Q17 61 74 48Q136 28 154 96L144 121L128 79L110 112L99 80L70 110L58 92Z" fill={isBell ? '#30303a' : '#a9b0be'} />
    {isBell ? <path d="M79 51L94 51L100 85L88 100L76 89Z" fill="#f4e9dd" /> : <path d="M132 76L156 67L153 96L135 89L145 132L134 123L128 87L108 93L111 70Z" fill="#b24e59" />}
    <path d="M38 107L44 163L29 195L49 187L56 213L60 163M144 107L139 165L154 200L133 191L126 215L120 163" fill={isBell ? '#30303a' : '#a9b0be'} />
    <path d="M58 126Q67 121 76 126M104 126Q113 121 122 126" stroke="#5b4242" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="68" cy="132" rx="4" ry="7" fill="#926344" /><ellipse cx="113" cy="132" rx="4" ry="7" fill="#926344" />
    <path d="M84 155Q90 158 97 154" stroke="#9b6a63" strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="56" cy="145" rx="10" ry="4" fill="#d39391" opacity=".45" /><ellipse cx="127" cy="145" rx="10" ry="4" fill="#d39391" opacity=".45" />
    <path d="M24 186L80 205L58 230M155 184L103 205L128 232" stroke="#bb9c68" fill="none" />
    {isBell ? <g><path d="M84 196L91 204L98 195" fill="none" stroke="#c5a873" /><path d="M82 210Q90 197 99 210L103 223H78Z" fill="#c5a873" /><circle cx="91" cy="224" r="3" fill="#dfbd7d" /></g> : null}
  </svg>;
}

export function Scene({ showLuna, showBell = true, evening, sign, caption, returnedBell }: { showLuna: boolean; showBell?: boolean; evening: boolean; sign?: string; caption?: string; returnedBell?: boolean }) {
  return <div className={`scene ${evening ? 'evening-scene' : ''}`} aria-label={evening ? '夕暮れの村はずれ' : '月明かりの見張り道'}>
    <div className="moon" aria-hidden="true" />
    <div className="stars" aria-hidden="true">·　✧　　·　　✦　　·　　✧</div>
    <div className="hills hill-back" aria-hidden="true" /><div className="hills hill-front" aria-hidden="true" />
    <div className="village" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    <div className="trees trees-left" aria-hidden="true">♠</div><div className="trees trees-right" aria-hidden="true">♠</div>
    <svg className="lantern" aria-hidden="true" viewBox="0 0 40 58"><path d="M12 11C12 0 28 0 28 11" fill="none" stroke="#d6b77f" strokeWidth="3" /><path d="M6 14H34L30 51H10Z" fill="#d6b77f" /><path d="M10 20H30L27 45H13Z" fill="#f9dca1" /><path d="M20 20V45M10 20L27 45M30 20L13 45" stroke="#8e7249" strokeWidth="2" /><path d="M8 52H32" stroke="#d6b77f" strokeWidth="4" /></svg>
    <div className="characters">{showBell ? <Portrait character="bell" /> : null}{showLuna ? <Portrait character="luna" /> : <div className="empty-forest" aria-hidden="true" />}</div>
    {returnedBell ? <svg className="returned-bell" viewBox="0 0 44 54" role="img" aria-label="ルナが拾って返した警報用の小さな鐘"><path d="M17 12V7a5 5 0 0 1 10 0v5M9 38h26l-5-9V21a8 8 0 0 0-16 0v8Z" fill="#d7b56c" stroke="#f0dbac" strokeWidth="2" /><circle cx="22" cy="42" r="4" fill="#f0dbac" /></svg> : null}
    {sign === 'TRACE' ? <span className="ribbon" aria-label="枝に残る赤いリボン">⋈</span> : null}
    <span className="scene-caption">{caption ?? (evening ? '村はずれ · 夕暮れ' : '見張り道 · 月の満ちる夜')}</span>
  </div>;
}
