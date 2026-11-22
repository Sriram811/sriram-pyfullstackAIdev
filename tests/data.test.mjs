import test from 'node:test'
import assert from 'node:assert/strict'
import { experience, projects as uProjects } from '../universe/src/data/portfolioData.js'
import { career, projects, categoryCounts } from '../src/data/screenData.js'

const ALIAS = { OOP: 'Object-Oriented Programming' }
test('career: periods and technologies come from the Universe data', () => {
  for (const c of career) {
    const e = experience.find((x) => x.org.toUpperCase().includes(c.org.split(' ')[0].toUpperCase()))
    assert.ok(e, `no Universe entry for ${c.org}`)
    assert.equal(c.period, e.period, `${c.org} period`)
    const hay = (e.points.join(' ') + ' ' + e.role).toLowerCase()
    for (const t of c.tech) assert.ok(hay.includes((ALIAS[t] || t).toLowerCase()), `${c.org}: "${t}" not in Universe data`)
  }
})
test('career: exactly one internship, the rest are labelled training', () => {
  assert.equal(career.filter((c) => c.kind === 'internship').length, 1)
  assert.equal(career.find((c) => c.kind === 'internship').org, 'Bluestock Fintech')
  assert.ok(career.every((c) => ['internship', 'training'].includes(c.kind)))
})
test('projects: technologies match the Universe data; unknown ones stay empty', () => {
  assert.equal(projects.length, 6)
  for (const p of projects) {
    const u = p.dataName && uProjects.find((x) => x.name === p.dataName)
    if (p.dataName) assert.ok(u, `${p.name} missing in Universe data`)
    assert.deepEqual(p.tech, u ? u.tech : [], `${p.name} tech`)
  }
})
test('projects: no fabricated links', () => {
  for (const p of projects) for (const k of ['repo', 'demo']) assert.ok(p[k] === null || /^https:\/\//.test(p[k]), `${p.name}.${k}`)
})
test('category counts are real', () => assert.deepEqual(Object.fromEntries(categoryCounts()), { AI: 4, Automation: 1, 'E-commerce': 1 }))
