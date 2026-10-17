"""Build public/strokes.json (stroke paths in drawing order) for the course's kanji and kana from a KanjiVG release zip.

    python3 -I scripts/build_strokes.py path/to/kanjivg-YYYYMMDD-main.zip

KanjiVG (c) Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net). The output keeps only each stroke's path data,
in KanjiVG's stroke order, and is shared under the same licence.
"""
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
kanji = [row[0] for row in json.loads((ROOT / 'src' / 'data' / 'jlpt' / 'kanji.json').read_text(encoding='utf-8'))]
# every hiragana in src/data/kana.ts (basic, voiced, the small ゃゅょ of combined sounds, small loanword vowels), then katakana
strings = re.findall(r"'[^'\n]*'|`[^`]*`", (ROOT / 'src' / 'data' / 'kana.ts').read_text(encoding='utf-8'))  # string literals, not the regexes
hira = sorted(set(re.findall('[ぁ-ゖ]', ''.join(strings))))
kana = hira + [chr(ord(c) + 0x60) for c in hira]
BASIC = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
out = {}
with zipfile.ZipFile(sys.argv[1]) as z:
    names = set(z.namelist())
    for k in kanji + kana:
        name = f'kanji/{ord(k):05x}.svg'
        if name not in names:
            if k in kanji or k in BASIC or chr(ord(k) - 0x60) in BASIC:
                raise SystemExit(f'No KanjiVG file for {k} ({name})')
            print(f'Skipped {k}: no KanjiVG file ({name})', file=sys.stderr)
            continue
        svg = z.read(name).decode('utf-8')
        # paths are numbered -s1, -s2 ... in drawing order; sort by that number, not file order
        strokes = sorted(re.findall(r'<path id="kvg:[0-9a-f]+-s(\d+)"[^>]* d="([^"]+)"', svg), key=lambda m: int(m[0]))
        out[k] = [d for _, d in strokes]
# one character per line: a rebuild diffs readably
text = '{\n' + ',\n'.join(f'{json.dumps(k, ensure_ascii=False)}:{json.dumps(v, separators=(",", ":"))}' for k, v in out.items()) + '\n}\n'
(ROOT / 'public' / 'strokes.json').write_text(text, encoding='utf-8')
print(f'{len(kanji)} kanji, {len(out) - len(kanji)} kana, {sum(map(len, out.values()))} strokes', file=sys.stderr)
