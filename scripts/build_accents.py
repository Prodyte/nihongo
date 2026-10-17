"""Build public/accents.json: the pitch accent (downstep position) of each course word, from Kanjium's accents.txt.

    python3 -I scripts/build_accents.py path/to/accents.txt

accents.txt is https://github.com/mifunetoshiro/kanjium/blob/master/data/source_files/raw/accents.txt (one word a line:
written, reading or '' for kana words, accents such as "0,2" or "(副)0,(名)3"). Kanjium (c) Uros O., CC BY-SA 4.0;
the output is shared under the same licence. Re-run it after words.json or vocab.ts change.

Output: {"written|reading": [downstep, ...]} keyed like public/examples.json (written is '' for kana words); 0 is heiban
(no drop), n is a drop after the n-th mora; the most common accent first. Matching, first hit wins: written + reading;
a する verb (written 勉強, read べんきょうする) as its noun (the noun's accent carries over: 勉強する is 0, 料理する 1); a kana
word as Kanjium's kana entry, else KANA_SPELLING, else every Kanjium word with that reading if they agree. Words with
no match are left out (the app then shows nothing).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# kana words Kanjium only lists under a kanji spelling, where homophones disagree (する: 為る 0, 刷る 1)
KANA_SPELLING = {'する': '為る', 'いい': '良い', 'この': '此の', 'その': '其の', 'なる': '成る', 'また': '又', 'できる': '出来る',
                 'ここ': '此処', 'よく': '良く', 'いくら': '幾ら', 'つける': '付ける', 'かける': '掛ける', 'きっと': '屹度', 'ごみ': '塵',
                 'ぶどう': '葡萄', 'ひげ': '髭', 'ちょうだい': '頂戴'}

hira = lambda s: ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)
moras = lambda s: len(re.sub('[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]', '', s))  # a small kana joins the mora before it

exact, by_reading = {}, {}
for line in Path(sys.argv[1]).read_text(encoding='utf-8').splitlines():
    w, r, acc = line.split('\t')
    nums = list(dict.fromkeys(int(n) for n in re.findall(r'\d+', re.sub(r'\([^)]*\)', '', acc))))  # drop (副) labels
    exact.setdefault((w, r or w), nums)
    by_reading.setdefault(hira(r or w), []).append(nums)

# course words: (written, reading) as in build_examples.py; starter words from vocab.ts
words = [(w, r) for _, w, r, _ in json.loads((ROOT / 'src/data/jlpt/words.json').read_text(encoding='utf-8'))]
for jp, _, _, kanji in re.findall(r"\['([^']+)', '([^']+)', (?:'[^']*'|\"[^\"]*\")(?:, '([^']*)')?\]()", (ROOT / 'src/path/vocab.ts').read_text(encoding='utf-8')):
    words.append((kanji, jp))


def accent(w, r):
    if (w or r, r) in exact:
        return exact[w or r, r]
    if r.endswith('する') and len(r) > 2:
        return accent(w.removesuffix('する') if w else '', r[:-2])
    if w:
        return None
    if r in KANA_SPELLING:
        return exact.get((KANA_SPELLING[r], r))
    same = by_reading.get(hira(r), [])
    return same[0] if same and all(s == same[0] for s in same) else None


out = {}
for w, r in words:
    nums = [n for n in accent(w, r) or [] if n <= moras(r)]  # a downstep past the last mora is a data error
    if nums:
        out[f'{w}|{r}'] = nums
text = '{\n' + ',\n'.join(f'{json.dumps(k, ensure_ascii=False)}:{json.dumps(v)}' for k, v in sorted(out.items())) + '\n}\n'
(ROOT / 'public/accents.json').write_text(text, encoding='utf-8')
keys = {f'{w}|{r}' for w, r in words}
print(f'{len(out)} of {len(keys)} words have a pitch accent ({len(out) / len(keys):.1%})', file=sys.stderr)
