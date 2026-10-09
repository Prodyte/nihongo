"""Build src/data/jlpt/{words,kanji}.json from data/raw (see data/raw/README.md for sources and licences).

Run by hand when the raw data or the rules below change, then commit the output:
    uv run --no-project --with wordfreq python -I scripts/build_course_data.py
wordfreq is only used to order words most-frequent-first; nothing from it is shipped.
"""
import csv
import json
import re
import sys
from pathlib import Path

from wordfreq import get_frequency_dict

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'data' / 'raw'
OUT = ROOT / 'src' / 'data' / 'jlpt'
LEVELS = [5, 4, 3]
MAX_GLOSS = 40  # characters: longer glosses crowd the answer buttons

# Hand fixes, keyed by the raw (expression, reading). None drops the entry.
OVERRIDES = {
    ('いただく', '頂く'): ('頂く', 'いただく', 'to receive (humble), to eat (humble)'),  # reading and kanji swapped in the source
    ('堅; 硬; 固い', 'かたい'): ('固い', 'かたい', 'hard, firm, solid'),  # the first variant lost its okurigana
    ('十', '(〜を) とお'): ('十', 'とお', 'ten (things)'),
    ('ごらんになる', ''): ('ご覧になる', 'ごらんになる', 'to see (honorific)'),  # no reading in the source
    ('かまう', ''): ('構う', 'かまう', 'to mind, to care about'),
}

KANA = re.compile(r'^[぀-ヿー]+$')
WRITTEN = re.compile(r'^[぀-ヿ一-鿿々ー]+$')


def split(s: str) -> list[str]:
    return [p.strip() for p in re.split(r'[;、]', s) if p.strip()]


def parts(g: str) -> list[str]:
    """Split on , and ; outside parentheses: "to wear small items (e.g., necktie)" stays one part."""
    out, cur, depth = [], '', 0
    for ch in g:
        depth += (ch == '(') - (ch == ')')
        if ch in ',;' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    return [p.strip(' -') for p in out + [cur]]


def clean_gloss(g: str) -> str:
    g = g.replace('(abbr.)', '')
    out: list[str] = []
    for part in parts(g):
        if not part or part in out:
            continue
        if out and len(', '.join(out + [part])) > MAX_GLOSS:
            break
        out.append(part)
    return ', '.join(out)


def clean(expr: str, reading: str, meaning: str):
    """(kanji or '', reading, gloss), or None for entries that are not standalone words."""
    if (expr, reading) in OVERRIDES:
        return OVERRIDES[(expr, reading)]
    if '～' in expr + reading or '〜' in expr + reading:
        return None  # affixes, counters and grammar patterns (～円, ～(て) しまう): taught as grammar, not as words
    strip = lambda s: re.sub(r'\s*\((する|かん|タイム|マーケット)\)', '', s)
    exprs, readings = split(strip(expr)), split(strip(reading))
    e, r = exprs[0], readings[0]  # variants (足; 脚, いい; よい, いく; ゆく): keep the first
    if not (WRITTEN.match(e) and KANA.match(r)):
        raise SystemExit(f'Unhandled entry {expr!r} {reading!r}: add an override')
    return ('' if e == r else e, r, clean_gloss(meaning))


def words():
    freq = get_frequency_dict('ja')
    out, seen, skipped = [], set(), []
    for level in LEVELS:
        rows = []
        for i, row in enumerate(csv.DictReader(open(RAW / f'jlpt-n{level}.csv', encoding='utf-8'))):
            c = clean(row['expression'], row['reading'], row['meaning'])
            if c is None:
                skipped.append(row['expression'])
                continue
            key = c[0] or c[1]  # the written form: 文字 read もじ or もんじ is one word
            if key in seen:
                continue  # listed twice (two levels or two readings): keep the first
            seen.add(key)
            f = max(freq.get(c[0] or c[1], 0), freq.get(c[1], 0) if not c[0] else 0)
            rows.append((-f, i, [level, *c]))
        out += [r for _, _, r in sorted(rows)]
    print(f'{len(out)} words, {len(skipped)} skipped as affixes/patterns', file=sys.stderr)
    return out


def kanji():
    raw = json.load(open(RAW / 'kanji-n5-n3.json', encoding='utf-8'))
    order = sorted(raw, key=lambda k: (-raw[k]['jlpt_new'], raw[k]['freq'] or 9999))
    out = []
    for k in order:
        v = raw[k]
        meanings = [m.lower() for m in v['meanings'] if 'radical' not in m.lower()][:3]
        kun = [re.sub(r'\.(.+)$', r'(\1)', r) for r in v['readings_kun']][:4]  # ひと.つ -> ひと(つ): the okurigana in brackets
        out.append([k, v['jlpt_new'], meanings, v['readings_on'][:3], kun, v['strokes']])
    print(f'{len(out)} kanji', file=sys.stderr)
    return out


def dump(name, rows):
    # one row per line: readable diffs when the data changes
    text = '[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n]\n'
    (OUT / name).write_text(text, encoding='utf-8')


OUT.mkdir(parents=True, exist_ok=True)
dump('words.json', words())
dump('kanji.json', kanji())
