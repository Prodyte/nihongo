"""Build src/data/jlpt/parts.json: each course kanji's visible parts with their meanings ([part, meaning]), from a KanjiVG release zip. Used as a memory aid
(明 = 日 sun + 月 moon). Pictographs with one part (日, 一) get none.

    python3 -I scripts/build_parts.py path/to/kanjivg-YYYYMMDD-main.zip

KanjiVG (c) Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net). Radical meanings below are common English names.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / 'src' / 'data' / 'jlpt' / 'kanji.json').read_text(encoding='utf-8'))
COURSE = {r[0] for r in rows}
# parts that are not course kanji (radicals, variant forms, rarer kanji): the name learners usually give them
RADICALS = {
    '氵': 'water', '亻': 'person', '扌': 'hand', '艹': 'grass', '宀': 'roof', '辶': 'road', '忄': 'heart', '糸': 'thread',
    '灬': 'fire', '礻': 'altar', '衤': 'clothes', '阝': 'hill', '刂': 'knife', '冖': 'cover', '广': 'house on a cliff',
    '疒': 'sickness', '彳': 'step', '攵': 'strike', '欠': 'yawn', '頁': 'head', '隹': 'bird', '貝': 'shell', '釒': 'metal',
    '飠': 'food', '犭': 'dog', '王': 'king', '禾': 'grain', '⺮': 'bamboo', '尸': 'flag', '厂': 'cliff', '囗': 'enclosure',
    '冂': 'frame', '亠': 'lid', '儿': 'legs', '丷': 'horns', '卜': 'divining rod', '匕': 'spoon', '勹': 'wrap', '厶': 'private',
    '又': 'again', '寸': 'inch', '尢': 'lame', '工': 'craft', '己': 'self', '巾': 'cloth', '干': 'dry', '幺': 'short thread',
    '廴': 'stretch', '弓': 'bow', '彡': 'hair', '戈': 'halberd', '斤': 'axe', '歹': 'death', '殳': 'weapon', '比': 'compare',
    '毛': 'fur', '氏': 'clan', '气': 'steam', '爪': 'claw', '爫': 'claw', '片': 'slice', '牛': 'cow', '牜': 'cow', '玉': 'jewel',
    '瓦': 'tile', '甘': 'sweet', '疋': 'bolt of cloth', '皿': 'dish', '矢': 'arrow', '示': 'altar', '穴': 'hole', '罒': 'net',
    '羊': 'sheep', '⺶': 'sheep', '羽': 'feathers', '而': 'rake', '聿': 'brush', '肉': 'meat', '⺼': 'flesh', '臼': 'mortar',
    '舌': 'tongue', '舟': 'boat', '虍': 'tiger', '虫': 'insect', '血': 'blood', '衣': 'clothes', '角': 'horn', '谷': 'valley',
    '豆': 'bean', '豕': 'pig', '辛': 'bitter', '辰': 'dragon', '酉': 'sake jar', '里': 'village', '革': 'leather', '首': 'neck',
    '骨': 'bone', '鬼': 'demon', '丶': 'dot', '丿': 'slash', '乙': 'fishhook', '乚': 'hook', '亅': 'barb', '二': 'two', '冫': 'ice',
    '几': 'table', '凵': 'open box', '勿': 'not', '夂': 'go slowly', '夊': 'go slowly', '彐': 'snout', '⺕': 'snout', '戸': 'door',
    '攴': 'strike', '无': 'nothing', '爿': 'split wood', '犬': 'dog', '疋': 'leg', '癶': 'footsteps', '禸': 'track', '缶': 'can',
    '耒': 'plough', '而': 'beard', '至': 'arrive', '艮': 'stopping', '豸': 'badger', '釆': 'divide', '隶': 'slave', '韋': 'leather',
    '黍': 'millet', '鼎': 'tripod', '龍': 'dragon', '亡': 'dead', '也': 'also', '尤': 'reason', '屮': 'sprout', '巛': 'river',
    '巴': 'snake', '戊': 'halberd', '乍': 'suddenly', '吾': 'I', '夕': 'evening', '士': 'samurai', '久': 'long time',
    '⻌': 'road', '⻖': 'hill', '⻏': 'village', '門': 'gate', '刀': 'sword', '⺌': 'small', '⺍': 'sparks', '耂': 'old man',
    '竹': 'bamboo', '龶': 'life', '⺤': 'claw', '皮': 'skin', '毋': 'mother', '乂': 'cross', '覀': 'cover', '氺': 'water',
    '⺦': 'hand', '⺨': 'dog', '⺷': 'sheep', '弋': 'stake', '匸': 'box', '䒑': 'horns', '彑': 'snout',
    '丁': 'street', '冊': 'book', '曰': 'say', '卩': 'seal', '㔾': 'seal', '屯': 'barracks', '匚': 'box', '癸': 'tenth',
}


def name(el):
    return RADICALS.get(el)


def meaning(el, original, meanings):
    for c in (el, original):
        if c and c in meanings:
            return meanings[c]
        if c and name(c):
            return name(c)
    return None


def parts(g, meanings, kvg):
    """Top-level parts with a meaning; a part without one is replaced by its own parts when it has some."""
    out = []
    for child in g.findall('svg:g', NS):
        el = child.get(kvg + 'element')
        if not el:
            out += parts(child, meanings, kvg)
            continue
        if child.get(kvg + 'part') not in (None, '1'):  # an element drawn in two pieces (e.g. 衣 around another part)
            continue
        if meaning(el, child.get(kvg + 'original'), meanings):
            out.append(el)
        else:
            out += parts(child, meanings, kvg) or [el]
    return out


# lone strokes and stroke-like pieces: listing them doesn't help anyone remember the kanji
STROKES = set('一丨丿丶乙乚亅𠂊𠂉丆𠂇㐄龰マ')
NS = {'svg': 'http://www.w3.org/2000/svg'}
KVG = 'kvg_'
meanings = {r[0]: r[2][0] for r in rows}
out, missing = {}, Counter()
with zipfile.ZipFile(sys.argv[1]) as z:
    for k in [r[0] for r in rows]:
        svg = z.read(f'kanji/{ord(k):05x}.svg').decode('utf-8')
        # the kvg namespace URL differs between releases: turn kvg:x attributes into plain kvg_x ones
        svg = re.sub(r'\skvg:(\w+)=', r' kvg_\1=', re.sub(r'\sxmlns:kvg="[^"]*"', '', svg))
        root = ET.fromstring(svg[svg.index('<svg '):])
        top = root.find(f".//svg:g[@id='kvg:{ord(k):05x}']", NS)
        ps = [p for p in parts(top, meanings, KVG) if p not in STROKES]
        if len(set(ps)) >= 2 and k not in ps:
            out[k] = [[p, meaning(p, None, meanings) or ''] for p in dict.fromkeys(ps)]
            missing.update(p for p in ps if not meaning(p, None, meanings))
text = '{\n' + ',\n'.join(f'{json.dumps(k, ensure_ascii=False)}:{json.dumps(v, ensure_ascii=False)}' for k, v in out.items()) + '\n}\n'
(ROOT / 'src' / 'data' / 'jlpt' / 'parts.json').write_text(text, encoding='utf-8')
print(f'{len(out)} of {len(rows)} kanji have parts; parts without a name: {missing.most_common(40)}', file=sys.stderr)
