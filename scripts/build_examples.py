"""Build public/examples.json: one short example sentence, with English, for each course word, from Tatoeba.

    python3 -I scripts/build_examples.py path/to/tatoeba-dir

The directory holds Tatoeba exports (https://tatoeba.org/downloads): jpn_indices.csv, jpn_sentences.tsv,
jpn_transcriptions.tsv and eng_sentences.tsv. Tatoeba sentences are CC BY 2.0 FR; the output keeps each sentence's id.

Matching uses the Japanese index (each sentence's words in dictionary form), so 食べました counts for 食べる. For each word
the easiest sentence wins: fewest words from beyond the word's level or outside the course, then human-checked furigana
and index entries, then shorter. A sentence already given to another word is avoided. A word keeps the sentence it already has.
"""
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = Path(sys.argv[1])
csv.field_size_limit(10**7)

# course words: [key, level], key = "written|reading" (written is '' for kana words); starter words count as N5
words = [(f'{w or ""}|{r}', lv) for lv, w, r, _ in json.loads((ROOT / 'src/data/jlpt/words.json').read_text(encoding='utf-8'))]
for jp, _, _, kanji in re.findall(r"\['([^']+)', '([^']+)', (?:'[^']*'|\"[^\"]*\")(?:, '([^']*)')?\]()", (ROOT / 'src/path/vocab.ts').read_text(encoding='utf-8')):
    words.append((f'{kanji}|{jp}', 5))
level_of = {}
for key, lv in words:
    w, r = key.split('|')
    for form in {w, r} - {''}:
        level_of.setdefault(form, lv)  # a form shared by two words: the easier level

HAN = re.compile(r'[一-鿿々]')
# index entry: headword(reading)[sense]{surface}~ ; ~ marks a checked entry
ENTRY = re.compile(r'^([^(\[{~]+)(?:\(([^)]+)\))?(?:\[\d+\])?(?:\{([^}]+)\})?(~)?$')


def furigana(t):
    """Tatoeba [漢字|か|な] → the app's 漢字[かな]; None when a bracket isn't kanji with a reading or a kanji is left bare."""
    out, ok = [], True

    def sub(m):
        nonlocal ok
        base, *reads = m.group(1).split('|')
        if not reads or not all(reads) or not re.fullmatch(r'[一-鿿々]+', base):
            ok = False
        return f'{base}[{"".join(reads)}]'
    s = re.sub(r'\[([^\]]+)\]', sub, t)
    if not ok or HAN.search(re.sub(r'[一-鿿々]+\[[^\]]+\]', '', s)):
        return None
    return s


jpn = {i: t for i, _, t in csv.reader(open(D / 'jpn_sentences.tsv', encoding='utf-8'), delimiter='\t')}
furi = {}
for i, _, _, user, t in csv.reader(open(D / 'jpn_transcriptions.tsv', encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
    f = furigana(t)
    if f:
        furi[i] = (f, bool(user))
need_eng = set()
cands = []  # (jpn id, eng id, set of headword forms, checked forms)
for jid, eid, text in csv.reader(open(D / 'jpn_indices.csv', encoding='utf-8'), delimiter='\t'):
    if jid not in jpn or jid not in furi or not 6 <= len(jpn[jid]) <= 28:
        continue
    forms, checked = [], set()
    for tok in text.split():
        m = ENTRY.match(tok)
        if not m:
            continue
        head, reading, _, ok = m.groups()
        forms.append((head, reading))
        if ok:
            checked.add(head)
    cands.append((jid, eid, forms, checked))
    need_eng.add(eid)
eng = {i: t for i, _, t in csv.reader(open(D / 'eng_sentences.tsv', encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE) if i in need_eng}

by_form = {}
for c in cands:
    if c[1] not in eng or len(eng[c[1]]) > 70:
        continue
    for head, reading in c[2]:
        by_form.setdefault(head, []).append(c)
        if reading:
            by_form.setdefault(reading, []).append(c)

# words that have a sentence keep it (learners have seen it): only words without one get a new pick
keys = {k for k, _ in words}
out = {k: v for k, v in json.loads((ROOT / 'public/examples.json').read_text(encoding='utf-8')).items() if k in keys}
used = {str(v[2]) for v in out.values()}
for key, lv in sorted(words, key=lambda x: -x[1]):  # N2 first: they have the fewest candidates
    if key in out:
        continue
    w, r = key.split('|')
    pool = by_form.get(w, []) if w else by_form.get(r, [])
    pool = [c for c in pool if (w and any(h == w and (not rd or rd == r) for h, rd in c[2])) or (not w and any(h == r or rd == r for h, rd in c[2]))]
    if not pool:
        continue

    def cost(c):
        others = [h for h, _ in c[2] if h not in (w, r)]
        hard = sum(1 for h in others if level_of.get(h, 0) < lv)  # a word from a later level (5 > 4 > 3 > 2)
        unknown = sum(1 for h in others if h not in level_of and HAN.search(h))
        return (c[0] in used, hard + 2 * unknown, not furi[c[0]][1], (w or r) not in c[3], len(jpn[c[0]]))
    best = min(pool, key=cost)
    used.add(best[0])
    out[key] = [furi[best[0]][0], eng[best[1]], int(best[0])]

text = '{\n' + ',\n'.join(f'{json.dumps(k, ensure_ascii=False)}:{json.dumps(v, ensure_ascii=False)}' for k, v in sorted(out.items())) + '\n}\n'
(ROOT / 'public/examples.json').write_text(text, encoding='utf-8')
print(f'{len(out)} of {len(words)} words have an example', file=sys.stderr)
