import { Fragment } from 'react'

const JA_RUN = /([\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]+)/ // kana, kanji, 。、 and full-width forms

/** Plain text with each run of Japanese wrapped in lang="ja", so a screen reader switches voice for it. */
export function JaText({ text }: { text: string }) {
  return <>{text.split(JA_RUN).map((part, i) => (i % 2 ? <span key={i} lang="ja">{part}</span> : <Fragment key={i}>{part}</Fragment>))}</>
}
