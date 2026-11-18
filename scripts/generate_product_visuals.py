"""Generate luxury studio cosmetic SVG product cards in public/assets/products/."""

from pathlib import Path

OUT_DIR = Path(r"c:\Users\Sandy\Downloads\client kemanjaan\public\assets\products")

ITEMS = [
    ("kmj-toner", "toner", "KEMANJAAN", "GLOW TONER", "100 ML", "#E87A90", "#FFF3F6"),
    ("kmj-bundle", "bundle", "KEMANJAAN", "GLOWING SET", "4 PCS", "#D4AF37", "#FFF9EE"),
    ("kmj-mist", "spray", "KEMANJAAN", "ROSE MIST", "60 ML", "#F1948A", "#FFF3F6"),
    ("kmj-cream", "jar", "KEMANJAAN", "NIGHT CREAM", "15 G", "#D4AF37", "#FFF9EE"),
    ("originote-moist", "jar", "ORIGINOTE", "HYALUCERA", "50 ML", "#5DADE2", "#F1F8FE"),
    ("originote-cica", "jar", "ORIGINOTE", "CICA-B5 GEL", "50 ML", "#58B19F", "#EFFAF6"),
    ("originote-serum", "dropper", "ORIGINOTE", "GLOW SERUM", "20 ML", "#E87A90", "#FFF3F6"),
    ("elformula-peel", "dropper", "ELFORMULA", "PEELING AHA", "35 ML", "#B03A2E", "#FDF2F2"),
    ("elformula-barrier", "jar", "ELFORMULA", "CERAMIDE", "50 ML", "#7D6608", "#FCF8EC"),
    ("facetology-sun", "tube", "FACETOLOGY", "TRIPLE SPF40", "40 ML", "#8E44AD", "#F7F1FC"),
    ("facetology-tinted", "tube", "FACETOLOGY", "TINTED SPF", "40 ML", "#C59B5F", "#FCF7EF"),
    ("npure-cica", "tube", "NPURE", "CICA SUN", "35 ML", "#27AE60", "#EFFAF3"),
    ("npure-toner", "toner", "NPURE", "CICA TONER", "150 ML", "#229954", "#EFFAF3"),
    ("hanasui-sun", "tube", "HANASUI", "COLLAGEN SPF", "30 ML", "#EC407A", "#FFF1F6"),
    ("hanasui-serum", "dropper", "HANASUI", "BRIGHTEXPERT", "20 ML", "#E87A90", "#FFF3F6"),
    ("hanasui-vitc", "dropper", "HANASUI", "VIT C + COL", "20 ML", "#F39C12", "#FFF8EC"),
    ("wardah-sun", "tube", "WARDAH", "UV SHIELD", "40 ML", "#16A085", "#EDFBF8"),
    ("wardah-wash", "tube", "WARDAH", "PERFECT BRIGHT", "100 ML", "#F06292", "#FFF1F6"),
    ("kmj-sheetmask", "mask", "KEMANJAAN", "SHEET MASK 5X", "5 PCS", "#E87A90", "#FFF3F6"),
    ("seamakeup-spray", "spray", "SEA MAKEUP", "LOCK IT MIST", "100 ML", "#1ABC9C", "#EDFBF8"),
    ("seamakeup-cushion", "cushion", "SEA MAKEUP", "ACNE CUSHION", "15 G", "#0D0C10", "#FAF5EE"),
    ("maybelline-vinyl", "lipstick", "MAYBELLINE", "VINYL INK", "4.2 ML", "#A93226", "#FDF2F2"),
    ("maybelline-skyhigh", "lipstick", "MAYBELLINE", "SKY HIGH", "6 ML", "#EC407A", "#FFF1F6"),
    ("you-cloudtouch", "lipstick", "Y.O.U", "CLOUD TOUCH", "2.5 G", "#D98880", "#FDF4F3"),
    ("omg-lipcream", "lipstick", "OMG", "MATTE LAST", "3.5 G", "#C2185B", "#FFF0F6"),
    ("hanasui-lip", "lipstick", "HANASUI", "BOBA LIP", "4 G", "#A04000", "#FDF5EE"),
    ("wardah-glasting", "lipstick", "WARDAH", "GLASTING LIP", "4 G", "#D81B60", "#FFF0F5"),
    ("kmj-palette", "palette", "WALL BEAUTY", "12 SHADOW", "PALETTE", "#C95870", "#FFF3F6"),
    ("marina-lotion", "lotion", "MARINA", "UV WHITE", "185 ML", "#3498DB", "#EFF7FD"),
    ("kahf-facewash", "tube", "KAHF", "OIL & ACNE", "100 ML", "#196F3D", "#EEF9F2"),
    ("kahf-edt", "perfume", "KAHF", "REVERED OUD", "35 ML", "#1F618D", "#EFF6FA"),
    ("kmj-parfum", "perfume", "KEMANJAAN", "HIJAB EDP", "30 ML", "#D4AF37", "#FFF9EC"),
    ("kmj-bag", "bag", "KEMANJAAN", "QUILTED BAG", "SLING BAG", "#B9770E", "#FCF6EE"),
    ("kmj-brush", "brush", "KEMANJAAN", "10 BRUSH SET", "ROSE GOLD", "#E87A90", "#FFF3F6"),
    ("kmj-backpack", "backpack", "KEMANJAAN", "CLEAR PVC", "BACKPACK", "#566573", "#F4F6F7"),
    ("kedai-combo", "kedai", "KEDAI KMJ", "DRINK+SNACK", "COMBO", "#D4AF37", "#FFF9EC"),
]


def shape_svg(kind: str, brand: str, title: str, sub: str, accent: str) -> str:
    if kind == "toner":
        return f"""
        <ellipse cx="300" cy="515" rx="95" ry="18" fill="rgba(13,12,16,0.12)"/>
        <rect x="245" y="105" width="110" height="58" rx="12" fill="url(#goldGrad)"/>
        <rect x="255" y="160" width="90" height="18" rx="4" fill="#0D0C10"/>
        <rect x="210" y="178" width="180" height="325" rx="42" fill="{accent}" stroke="#FFFFFF" stroke-width="5"/>
        <rect x="228" y="232" width="144" height="196" rx="20" fill="rgba(255,255,255,0.94)"/>
        <circle cx="300" cy="280" r="24" fill="#0D0C10"/>
        <path d="M286 279l7-10 7 7 7-7 7 10v9h-28z" fill="#D4AF37"/>
        <text x="300" y="340" text-anchor="middle" font-size="20" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="370" text-anchor="middle" font-size="15" font-weight="700" fill="#B88A28" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="396" text-anchor="middle" font-size="13" font-weight="600" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        <rect x="226" y="196" width="18" height="284" rx="9" fill="rgba(255,255,255,0.28)"/>
        """
    if kind == "bundle":
        return f"""
        <ellipse cx="300" cy="515" rx="165" ry="20" fill="rgba(13,12,16,0.12)"/>
        <rect x="330" y="195" width="150" height="295" rx="28" fill="#0D0C10" stroke="#D4AF37" stroke-width="5"/>
        <text x="405" y="335" text-anchor="middle" font-size="22" font-weight="800" fill="#F3E5AB" font-family="Georgia,serif">POUCH</text>
        <text x="405" y="365" text-anchor="middle" font-size="14" font-weight="700" fill="#E87A90" font-family="Arial,sans-serif">EXCLUSIVE</text>
        <rect x="135" y="130" width="110" height="360" rx="30" fill="#E87A90" stroke="#FFF" stroke-width="4"/>
        <rect x="162" y="88" width="56" height="44" rx="8" fill="url(#goldGrad)"/>
        <rect x="150" y="210" width="80" height="150" rx="12" fill="#FFF"/>
        <text x="190" y="290" text-anchor="middle" font-size="15" font-weight="800" fill="#0D0C10" font-family="Arial,sans-serif">TONER</text>
        <rect x="245" y="165" width="110" height="325" rx="30" fill="#F29CB0" stroke="#FFF" stroke-width="4"/>
        <rect x="272" y="122" width="56" height="44" rx="8" fill="url(#goldGrad)"/>
        <rect x="260" y="240" width="80" height="145" rx="12" fill="#FFF"/>
        <text x="300" y="315" text-anchor="middle" font-size="15" font-weight="800" fill="#0D0C10" font-family="Arial,sans-serif">TONER</text>
        <circle cx="430" cy="145" r="42" fill="#D4AF37"/>
        <text x="430" y="153" text-anchor="middle" font-size="19" font-weight="900" fill="#0D0C10" font-family="Arial,sans-serif">4 PCS</text>
        """
    if kind == "dropper":
        return f"""
        <ellipse cx="300" cy="515" rx="95" ry="18" fill="rgba(13,12,16,0.12)"/>
        <path d="M278 88c0-20 44-20 44 0v54h-44z" fill="#0D0C10"/>
        <rect x="252" y="140" width="96" height="36" rx="8" fill="url(#goldGrad)"/>
        <path d="M214 218c0-28 28-44 86-44s86 16 86 44v245c0 24-18 38-42 38h-88c-24 0-42-14-42-38z" fill="{accent}" stroke="#FFF" stroke-width="5"/>
        <rect x="234" y="256" width="132" height="184" rx="16" fill="rgba(255,255,255,0.94)"/>
        <text x="300" y="328" text-anchor="middle" font-size="22" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="362" text-anchor="middle" font-size="15" font-weight="700" fill="{accent}" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="390" text-anchor="middle" font-size="13" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "jar":
        return f"""
        <ellipse cx="300" cy="495" rx="135" ry="20" fill="rgba(13,12,16,0.12)"/>
        <rect x="165" y="250" width="270" height="225" rx="46" fill="#FFF" stroke="{accent}" stroke-width="6"/>
        <rect x="175" y="185" width="250" height="76" rx="24" fill="{accent}"/>
        <rect x="195" y="200" width="210" height="10" rx="5" fill="#F3E5AB"/>
        <rect x="202" y="295" width="196" height="132" rx="20" fill="#FAF6F8"/>
        <text x="300" y="346" text-anchor="middle" font-size="23" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="378" text-anchor="middle" font-size="16" font-weight="700" fill="{accent}" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="405" text-anchor="middle" font-size="13" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "tube":
        return f"""
        <ellipse cx="300" cy="515" rx="95" ry="18" fill="rgba(13,12,16,0.12)"/>
        <path d="M204 115h192l-30 315H234z" fill="{accent}" stroke="#FFF" stroke-width="5"/>
        <rect x="202" y="102" width="196" height="28" rx="6" fill="#0D0C10"/>
        <rect x="246" y="430" width="108" height="68" rx="10" fill="#FFF" stroke="#D4AF37" stroke-width="4"/>
        <rect x="234" y="190" width="132" height="162" rx="16" fill="rgba(255,255,255,0.95)"/>
        <text x="300" y="252" text-anchor="middle" font-size="20" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="284" text-anchor="middle" font-size="15" font-weight="700" fill="{accent}" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="312" text-anchor="middle" font-size="13" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "spray":
        return f"""
        <ellipse cx="300" cy="515" rx="95" ry="18" fill="rgba(13,12,16,0.12)"/>
        <rect x="262" y="80" width="76" height="72" rx="12" fill="#FFF" stroke="#0D0C10" stroke-width="4"/>
        <circle cx="300" cy="112" r="10" fill="#0D0C10"/>
        <rect x="250" y="152" width="100" height="28" rx="6" fill="url(#goldGrad)"/>
        <rect x="210" y="180" width="180" height="320" rx="38" fill="{accent}" stroke="#FFF" stroke-width="5"/>
        <rect x="230" y="242" width="140" height="186" rx="18" fill="rgba(255,255,255,0.94)"/>
        <text x="300" y="318" text-anchor="middle" font-size="20" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="348" text-anchor="middle" font-size="15" font-weight="700" fill="{accent}" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="376" text-anchor="middle" font-size="13" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "lipstick":
        return f"""
        <ellipse cx="300" cy="515" rx="88" ry="16" fill="rgba(13,12,16,0.12)"/>
        <rect x="250" y="295" width="100" height="205" rx="16" fill="#0D0C10" stroke="#D4AF37" stroke-width="4"/>
        <rect x="250" y="262" width="100" height="36" rx="4" fill="url(#goldGrad)"/>
        <path d="M266 262V156c0-28 68-72 68-22v128z" fill="{accent}"/>
        <rect x="266" y="342" width="68" height="114" rx="8" fill="rgba(255,255,255,0.12)"/>
        <text x="300" y="392" text-anchor="middle" font-size="16" font-weight="800" fill="#F3E5AB" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="418" text-anchor="middle" font-size="12" font-weight="700" fill="#FFF" font-family="Arial,sans-serif">{title}</text>
        """
    if kind == "cushion":
        return f"""
        <ellipse cx="300" cy="495" rx="140" ry="20" fill="rgba(13,12,16,0.12)"/>
        <circle cx="300" cy="300" r="160" fill="#0D0C10" stroke="#D4AF37" stroke-width="8"/>
        <circle cx="300" cy="300" r="126" fill="none" stroke="rgba(243,229,171,0.5)" stroke-width="2"/>
        <circle cx="300" cy="300" r="102" fill="#1D1A24"/>
        <text x="300" y="286" text-anchor="middle" font-size="24" font-weight="800" fill="#F3E5AB" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="318" text-anchor="middle" font-size="15" font-weight="700" fill="#E87A90" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="344" text-anchor="middle" font-size="13" fill="#FFF" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "palette":
        return f"""
        <ellipse cx="300" cy="500" rx="165" ry="20" fill="rgba(13,12,16,0.12)"/>
        <rect x="130" y="140" width="340" height="335" rx="30" fill="#0D0C10" stroke="#D4AF37" stroke-width="6"/>
        <rect x="160" y="170" width="280" height="115" rx="16" fill="#2A2632"/>
        <text x="300" y="228" text-anchor="middle" font-size="22" font-weight="700" fill="#F3E5AB" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="256" text-anchor="middle" font-size="13" letter-spacing="2" fill="#E87A90" font-family="Arial,sans-serif">{title}</text>
        <rect x="162" y="308" width="58" height="58" rx="10" fill="#F5B7B1"/>
        <rect x="234" y="308" width="58" height="58" rx="10" fill="#D4AF37"/>
        <rect x="306" y="308" width="58" height="58" rx="10" fill="#E87A90"/>
        <rect x="378" y="308" width="58" height="58" rx="10" fill="#A93226"/>
        <rect x="162" y="380" width="58" height="58" rx="10" fill="#FADBD8"/>
        <rect x="234" y="380" width="58" height="58" rx="10" fill="#E6B0AA"/>
        <rect x="306" y="380" width="58" height="58" rx="10" fill="#CD6155"/>
        <rect x="378" y="380" width="58" height="58" rx="10" fill="#7D3C98"/>
        """
    if kind == "mask":
        return f"""
        <ellipse cx="300" cy="515" rx="125" ry="18" fill="rgba(13,12,16,0.1)"/>
        <rect x="172" y="110" width="248" height="378" rx="24" fill="#FADADD" stroke="#FFF" stroke-width="5" transform="rotate(-6 300 300)"/>
        <rect x="190" y="122" width="248" height="378" rx="24" fill="{accent}" stroke="#FFF" stroke-width="5"/>
        <circle cx="314" cy="272" r="72" fill="#FFF"/>
        <text x="314" y="264" text-anchor="middle" font-size="22" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">SHEET</text>
        <text x="314" y="294" text-anchor="middle" font-size="18" font-weight="700" fill="#B88A28" font-family="Arial,sans-serif">MASK 5X</text>
        <text x="314" y="420" text-anchor="middle" font-size="18" font-weight="800" fill="#FFF" font-family="Arial,sans-serif">{brand}</text>
        """
    if kind == "lotion":
        return f"""
        <ellipse cx="300" cy="515" rx="105" ry="18" fill="rgba(13,12,16,0.12)"/>
        <path d="M285 80h62v22h-48v42h-14z" fill="#0D0C10"/>
        <rect x="262" y="140" width="76" height="36" rx="8" fill="url(#goldGrad)"/>
        <rect x="204" y="176" width="192" height="325" rx="56" fill="{accent}" stroke="#FFF" stroke-width="5"/>
        <rect x="225" y="252" width="150" height="168" rx="22" fill="rgba(255,255,255,0.95)"/>
        <text x="300" y="324" text-anchor="middle" font-size="23" font-weight="800" fill="#0D0C10" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="356" text-anchor="middle" font-size="15" font-weight="700" fill="{accent}" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="384" text-anchor="middle" font-size="13" fill="#666" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "perfume":
        return f"""
        <ellipse cx="300" cy="515" rx="115" ry="18" fill="rgba(13,12,16,0.12)"/>
        <rect x="252" y="102" width="96" height="72" rx="14" fill="#0D0C10" stroke="#D4AF37" stroke-width="4"/>
        <rect x="264" y="174" width="72" height="24" fill="url(#goldGrad)"/>
        <rect x="184" y="198" width="232" height="302" rx="38" fill="rgba(243,229,171,0.35)" stroke="#D4AF37" stroke-width="6"/>
        <rect x="202" y="216" width="196" height="266" rx="26" fill="{accent}" opacity="0.24"/>
        <rect x="222" y="274" width="156" height="140" rx="16" fill="#0D0C10"/>
        <text x="300" y="330" text-anchor="middle" font-size="22" font-weight="800" fill="#F3E5AB" font-family="Georgia,serif">{brand}</text>
        <text x="300" y="360" text-anchor="middle" font-size="13" font-weight="700" fill="#FFF" font-family="Arial,sans-serif">{title}</text>
        <text x="300" y="384" text-anchor="middle" font-size="12" fill="#E87A90" font-family="Arial,sans-serif">{sub}</text>
        """
    if kind == "bag":
        return f"""
        <ellipse cx="300" cy="505" rx="150" ry="20" fill="rgba(13,12,16,0.12)"/>
        <path d="M214 214c0-78 172-78 172 0" fill="none" stroke="#D4AF37" stroke-width="10" stroke-dasharray="10 8"/>
        <rect x="142" y="214" width="316" height="268" rx="36" fill="{accent}" stroke="#0D0C10" stroke-width="6"/>
        <path d="M142 248l158 102 158-102" fill="none" stroke="rgba(13,12,16,0.32)" stroke-width="6"/>
        <line x1="204" y1="290" x2="396" y2="440" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>
        <line x1="396" y1="290" x2="204" y2="440" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>
        <rect x="270" y="328" width="60" height="42" rx="10" fill="#0D0C10" stroke="#F3E5AB" stroke-width="4"/>
        """
    if kind == "brush":
        return f"""
        <ellipse cx="300" cy="505" rx="130" ry="18" fill="rgba(13,12,16,0.12)"/>
        <g transform="rotate(-14 300 300)">
          <rect x="204" y="232" width="24" height="248" rx="12" fill="#E87A90"/>
          <rect x="204" y="190" width="24" height="46" fill="url(#goldGrad)"/>
          <path d="M190 190c0-54 52-54 52 0z" fill="#3D2C2E"/>
        </g>
        <g>
          <rect x="284" y="212" width="32" height="272" rx="14" fill="#0D0C10"/>
          <rect x="284" y="164" width="32" height="52" fill="url(#goldGrad)"/>
          <path d="M262 164c0-72 76-72 76 0z" fill="#E87A90"/>
        </g>
        <g transform="rotate(14 300 300)">
          <rect x="372" y="232" width="24" height="248" rx="12" fill="#E87A90"/>
          <rect x="372" y="190" width="24" height="46" fill="url(#goldGrad)"/>
          <path d="M358 190c0-54 52-54 52 0z" fill="#3D2C2E"/>
        </g>
        """
    if kind == "backpack":
        return f"""
        <ellipse cx="300" cy="505" rx="140" ry="18" fill="rgba(13,12,16,0.12)"/>
        <path d="M244 162c0-48 112-48 112 0" fill="none" stroke="#0D0C10" stroke-width="14"/>
        <rect x="168" y="162" width="264" height="332" rx="64" fill="rgba(255,255,255,0.75)" stroke="#0D0C10" stroke-width="8"/>
        <rect x="204" y="316" width="192" height="136" rx="32" fill="rgba(232,122,144,0.22)" stroke="#0D0C10" stroke-width="5"/>
        <rect x="256" y="236" width="88" height="42" rx="12" fill="#0D0C10"/>
        <text x="300" y="263" text-anchor="middle" font-size="18" font-weight="800" fill="#F3E5AB" font-family="Arial,sans-serif">CLEAR</text>
        """
    # kedai
    return f"""
    <ellipse cx="300" cy="505" rx="155" ry="20" fill="rgba(13,12,16,0.12)"/>
    <line x1="252" y1="90" x2="228" y2="198" stroke="#0D0C10" stroke-width="12" stroke-linecap="round"/>
    <path d="M156 198h144l-18 286H174z" fill="#F3E5AB" stroke="#0D0C10" stroke-width="7"/>
    <path d="M162 270h132l-9 138H171z" fill="#8B5A2B" opacity="0.88"/>
    <ellipse cx="228" cy="198" rx="72" ry="16" fill="#FFF" stroke="#0D0C10" stroke-width="6"/>
    <rect x="312" y="310" width="138" height="174" rx="26" fill="#0D0C10" stroke="#D4AF37" stroke-width="6"/>
    <text x="381" y="388" text-anchor="middle" font-size="22" font-weight="800" fill="#F3E5AB" font-family="Georgia,serif">SNACK</text>
    <text x="381" y="418" text-anchor="middle" font-size="16" font-weight="700" fill="#E87A90" font-family="Arial,sans-serif">KEDAI KMJ</text>
    """


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, kind, brand, title, sub, accent, bg in ITEMS:
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="{bg}"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#B88A28"/>
      <stop offset="50%" stop-color="#F6E299"/>
      <stop offset="100%" stop-color="#B88A28"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad)"/>
  <circle cx="300" cy="300" r="245" fill="none" stroke="rgba(212,175,55,0.22)" stroke-width="2"/>
  {shape_svg(kind, brand, title, sub, accent)}
</svg>
"""
        (OUT_DIR / f"{slug}.svg").write_text(svg, encoding="utf-8")
    print(f"Generated {len(ITEMS)} studio cosmetic SVGs in {OUT_DIR}")


if __name__ == "__main__":
    main()
