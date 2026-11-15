"""Text normalisation for narration.

Every display token of the script (what the captions show, exactly as written) gets:
  * tts   - what the voice engine is asked to say for it (numbers spelled out, pronunciations applied)
  * align - the plain lowercase words a forced aligner should look for in the audio

Captions always come from the display text, never from speech recognition, so they cannot contain
transcription mistakes. Timing comes from aligning the `align` words, which are the words the TTS
engine was literally asked to read.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

from num2words import num2words

MAGNITUDE_WORDS = {"hundred", "thousand", "million", "billion", "trillion"}
SUFFIX_MAGNITUDE = {"k": "thousand", "m": "million", "b": "billion", "bn": "billion", "t": "trillion", "tn": "trillion"}
CURRENCY = {"$": ("dollar", "dollars"), "€": ("euro", "euros"), "£": ("pound", "pounds"), "¥": ("yen", "yen")}
LETTER_NAMES = {
    "a": "ay", "b": "bee", "c": "see", "d": "dee", "e": "ee", "f": "eff", "g": "jee", "h": "aitch", "i": "eye",
    "j": "jay", "k": "kay", "l": "el", "m": "em", "n": "en", "o": "oh", "p": "pee", "q": "cue", "r": "ar",
    "s": "ess", "t": "tee", "u": "you", "v": "vee", "w": "double you", "x": "ex", "y": "why", "z": "zee",
}
# Upper-case words that are read as words, not spelled out.
PRONOUNCEABLE = {
    "NASA", "NATO", "FIFA", "UNESCO", "UNICEF", "OPEC", "COVID", "LASER", "RADAR", "SCUBA", "ASAP", "GIF", "JPEG",
    "PIN", "SIM", "ZIP", "IKEA", "LEGO", "OLED", "SWAT", "AIDS", "NAFTA", "FOMO", "YOLO", "CAPTCHA", "WIFI", "SAAS",
    "ROM", "RAM", "GUI", "CEO", "OK", "TV",
}
SPELLED_EXCEPTIONS = {"CEO", "TV", "OK", "GUI", "RAM", "ROM"}  # common ones TTS spells anyway
SYMBOL_WORDS = {"&": "and", "+": "plus", "=": "equals", "@": "at", "#": "number", "vs": "versus", "vs.": "versus",
                "e.g.": "for example", "i.e.": "that is", "etc.": "et cetera", "w/": "with", "w/o": "without"}

LEAD_PUNCT = "\"'“”‘’(«[¿¡"
TRAIL_PUNCT = "\"'“”‘’)»].,!?;:…—–-"


@dataclass
class Token:
    display: str                     # exactly as in the script (captions use this)
    tts: str                         # text sent to the voice engine for this token
    align: list[str] = field(default_factory=list)  # words the aligner looks for
    emph: bool = False               # marked with *stars* in the script: boxed keyword in captions


def _num_words(n: float | int, kind: str = "cardinal") -> str:
    if kind == "year":
        return num2words(int(n), to="year")
    if kind == "ordinal":
        return num2words(int(n), to="ordinal")
    if isinstance(n, float) and not n.is_integer():
        return num2words(n)
    return num2words(int(n))


def _split_punct(tok: str) -> tuple[str, str, str]:
    i, j = 0, len(tok)
    while i < j and tok[i] in LEAD_PUNCT:
        i += 1
    while j > i and tok[j - 1] in TRAIL_PUNCT:
        j -= 1
    return tok[:i], tok[i:j], tok[j:]


def _deaccent(s: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", s) if not unicodedata.combining(ch))


def _align_words(spoken: str) -> list[str]:
    out = []
    for w in re.split(r"[\s\-–—/]+", _deaccent(spoken).lower()):
        w = re.sub(r"[^a-z0-9']", "", w).strip("'")
        if w:
            out.append(w)
    return out


def _acronym_align(core: str) -> list[str] | None:
    letters = re.sub(r"[^A-Za-z]", "", core)
    if 2 <= len(letters) <= 6 and letters.isupper() and core.upper() not in PRONOUNCEABLE - SPELLED_EXCEPTIONS:
        if core.upper() in PRONOUNCEABLE and core.upper() not in SPELLED_EXCEPTIONS:
            return None
        names: list[str] = []
        for ch in letters.lower():
            names.extend(LETTER_NAMES[ch].split())
        return names
    return None


def expand_core(core: str, nxt: str | None) -> tuple[str, bool] | None:
    """Spell out a number-ish core token. Returns (spoken text, consumes_currency_after_magnitude)."""
    low = core.lower()
    if low in SYMBOL_WORDS:
        return SYMBOL_WORDS[low], False
    m = re.fullmatch(r"([$€£¥])?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(k|m|b|bn|t|tn|%|x|s|st|nd|rd|th|\+)?", core, re.I)
    if m:
        cur, num_s, suf = m.group(1), m.group(2), (m.group(3) or "").lower()
        num_clean = num_s.replace(",", "")
        val = float(num_clean) if "." in num_clean else int(num_clean)
        nxt_core = _split_punct(nxt)[1].lower() if nxt else ""
        words: list[str] = []
        if suf in ("st", "nd", "rd", "th"):
            words.append(_num_words(val, "ordinal"))
        elif suf == "s" and isinstance(val, int) and 1000 <= val <= 2099 and val % 10 == 0:
            yr = _num_words(val, "year")
            words.append(yr[:-1] + "ies" if yr.endswith("y") else yr + "s")
        elif (cur is None and suf == "" and isinstance(val, int) and 1100 <= val <= 2099 and "," not in num_s
              and nxt_core not in MAGNITUDE_WORDS):
            words.append(_num_words(val, "year"))
        else:
            words.append(_num_words(val))
        if suf in SUFFIX_MAGNITUDE:
            words.append(SUFFIX_MAGNITUDE[suf])
        elif suf == "%":
            words.append("percent")
        elif suf == "x":
            words.append("x")
        elif suf == "+":
            words.append("plus")
        if cur:
            sing, plur = CURRENCY[cur]
            unit = sing if val == 1 and suf not in SUFFIX_MAGNITUDE else plur
            if nxt_core in MAGNITUDE_WORDS:
                return " ".join(words), True   # "$6 billion" -> "six" + "billion dollars"
            words.append(unit)
        return " ".join(words), False
    m = re.fullmatch(r"(\d{1,2}):(\d{2})", core)
    if m:
        h, mi = int(m.group(1)), int(m.group(2))
        tail = "" if mi == 0 else (f"oh {num2words(mi)}" if mi < 10 else num2words(mi))
        return f"{num2words(h)} {tail}".strip(), False
    m = re.fullmatch(r"(\d{3,4})[-–](\d{2,4})", core)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        if b < 100:
            b = (a // 100) * 100 + b
        return f"{_num_words(a, 'year')} to {_num_words(b, 'year')}", False
    m = re.fullmatch(r"(\d+)/(\d+)", core)
    if m:
        return f"{num2words(int(m.group(1)))} {num2words(int(m.group(2)))}", False
    if re.fullmatch(r"#\d+", core):
        return f"number {num2words(int(core[1:]))}", False
    return None


def normalize_sentence(text: str, pronounce: dict[str, str] | None = None, spell_acronyms: bool = True) -> list[Token]:
    """Split a script line into display tokens with their spoken forms.

    *word* marks an emphasised keyword (boxed in captions); the stars are not displayed or spoken.
    `pronounce` maps a word (case-insensitive) to how it should be said, e.g. {"Nomen": "No-men"}.
    """
    pronounce = {k.lower(): v for k, v in (pronounce or {}).items()}
    raw = text.split()
    tokens: list[Token] = []
    pending_currency: str | None = None
    for idx, tok in enumerate(raw):
        emph = False
        if "*" in tok:
            emph = True
            tok = tok.replace("*", "")
            if not tok:
                continue
        nxt = raw[idx + 1].replace("*", "") if idx + 1 < len(raw) else None
        lead, core, trail = _split_punct(tok)
        spoken: str
        align: list[str]
        if not core:
            tokens.append(Token(display=tok, tts=tok, align=[], emph=emph))
            continue
        if core.lower() in pronounce:
            spoken = pronounce[core.lower()]
            align = _align_words(spoken)
        else:
            ex = expand_core(core, nxt)
            if ex is not None:
                spoken, defer = ex
                if defer:
                    pending_currency = CURRENCY[core[0]][1]
                align = _align_words(spoken)
            else:
                spoken = core
                acr = _acronym_align(core) if spell_acronyms else None
                align = acr if acr is not None else _align_words(core)
        if pending_currency and core.lower() in MAGNITUDE_WORDS and not core[0] in CURRENCY:
            spoken = f"{core} {pending_currency}"
            align = _align_words(spoken)
            pending_currency = None
        tokens.append(Token(display=tok, tts=f"{lead}{spoken}{trail}", align=align, emph=emph))
    return tokens


def tts_text(tokens: list[Token]) -> str:
    return " ".join(t.tts for t in tokens).strip()


def display_text(tokens: list[Token]) -> str:
    return " ".join(t.display for t in tokens).strip()


if __name__ == "__main__":
    import json
    import sys
    s = " ".join(sys.argv[1:]) or "How could one *single* laptop cost $6 billion? On October 29th, 2026, the FBI found 12,000 wallets & 40% were empty in the 1990s."
    toks = normalize_sentence(s)
    print(tts_text(toks))
    print(json.dumps([t.__dict__ for t in toks], ensure_ascii=False, indent=1))
