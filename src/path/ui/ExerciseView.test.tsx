// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ITEMS } from '../course'
import type { Exercise } from '../lesson'
import { ExerciseView } from './ExerciseView'

afterEach(cleanup)

const item = ITEMS.get('kana:あ')!
const choice: Exercise = { type: 'choice', item, dir: 'toGloss', prompt: 'あ', options: ['a', 'i', 'u', 'e'], answer: 'a' }
const typing: Exercise = { type: 'type', item, dir: 'toRomaji', prompt: 'あ' }
const view = (ex: Exercise, step: number) => <ExerciseView ex={ex} step={step} autoplay={false} onDone={() => {}} onSkipSpeaking={() => {}} />

it('a new exercise moves focus to its question, but leaves an input that focuses itself alone', () => {
  const { rerender } = render(view(choice, 0))
  expect(document.activeElement).toBe(document.querySelector('.q'))
  rerender(view(typing, 1))
  expect(document.activeElement?.tagName).toBe('INPUT')
})
