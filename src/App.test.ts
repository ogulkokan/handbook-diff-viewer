import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'

import App from './App.vue'

// The app keeps its state in the address. Each test starts from a clean one.
beforeEach(() => history.replaceState(null, '', '/'))
// The app is attached to the page, so that focus and ids work. Each test removes its own app:
// two apps in one page would share their node ids.
enableAutoUnmount(afterEach)

async function mountApp(address = '/') {
  history.replaceState(null, '', address)
  const wrapper = mount(App, { attachTo: document.body })
  // The versions load through dynamic imports, which take more than one tick.
  await vi.waitFor(() => expect(wrapper.find('main').exists()).toBe(true))
  return wrapper
}

/** A button by the text that the reader sees. */
function button(wrapper: VueWrapper, name: string) {
  const found = wrapper.findAll('button').filter((candidate) => candidate.text() === name)
  expect(found, `button "${name}"`).toHaveLength(1)
  return found[0]!
}

const summary = (wrapper: VueWrapper) => wrapper.get('header p[role="status"]').text()

describe('App', () => {
  it('opens on the previous version against the latest', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    // data/: versions 1, 2 and 3. The default comparison is v2 with v3 (D2).
    expect(wrapper.get('h1').text()).toBe('Team Handbook')
    expect(base!.element.value).toBe('2')
    expect(target!.element.value).toBe('3')
  })

  it('shows the 10 changes of v2 to v3 in the summary and in the change list', async () => {
    const wrapper = await mountApp()

    // docs/SPEC.md: 1 added, 1 removed, 8 edited, no formatting change.
    expect(summary(wrapper)).toBe('10 changes')
    expect(wrapper.findAll('nav[aria-labelledby="changes-heading"] li')).toHaveLength(10)
    // v2 to v3 has no formatting change, so the app offers no control for them.
    expect(wrapper.text()).not.toContain('Show formatting changes')
  })

  it('shows the document with its outline, and the nested section inside its parent', async () => {
    const wrapper = await mountApp()

    expect(wrapper.findAll('main section')).toHaveLength(9)
    expect(wrapper.get('nav[aria-label="Outline"] a[href="#sec-remote"] span').text()).toBe(
      'Remote Work',
    )
    expect(wrapper.get('#sec-expenses #sec-travel h3').text()).toBe('Travel')
  })

  it('lets the reader choose version 1 as the base, and then hides 2 formatting changes', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    await target!.setValue('2')
    await base!.setValue('1')

    // docs/SPEC.md: v1 to v2 has 12 changes and 2 formatting changes.
    expect(summary(wrapper)).toBe('12 changes 2 formatting changes are hidden.')
    // The paragraph is in the page, and it shows no mark while formatting changes are hidden.
    expect(wrapper.find('#p-leave-sick-1').exists()).toBe(true)
    expect(wrapper.find('#p-leave-sick-1 del').exists()).toBe(false)
    expect(wrapper.find('#f-exp-equipment-limit del').exists()).toBe(false)

    await button(wrapper, 'Show formatting changes').trigger('click')

    expect(summary(wrapper)).toBe('14 changes 2 formatting changes are shown.')
    expect(button(wrapper, 'Show formatting changes').attributes('aria-pressed')).toBe('true')
    // data/: "1,000 EUR" in v1 and "1000 EUR" in v2.
    expect(wrapper.get('#f-exp-equipment-limit del').text()).toBe('Removed: 1,000 EUR')
    expect(wrapper.get('#f-exp-equipment-limit ins').text()).toBe('Added: 1000 EUR')
  })

  it('never offers a base version that is not older than the target', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    await target!.setValue('2')

    const offered = base!.findAll<HTMLOptionElement>('option').map((option) => option.element.value)
    expect(offered).toEqual(['1'])
    expect(
      target!.findAll<HTMLOptionElement>('option').map((option) => option.element.value),
    ).toEqual(['2', '3'])
  })
})

describe('App: a removed node', () => {
  it('marks the text below a removed clause as removed for a screen reader', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')
    await target!.setValue('2')
    await base!.setValue('1')

    // v1 to v2 removes cl-sec-passwords with its paragraph. Only the clause has a badge.
    expect(wrapper.get('#cl-sec-passwords h3 del').text()).toBe('Removed: Passwords')
    expect(wrapper.get('#p-sec-passwords-1 del').text()).toContain('Removed: Use the company')
    // The clause that replaced it is current text, with no <del>.
    expect(wrapper.find('#cl-sec-credentials del').exists()).toBe(false)
  })
})

describe('App: markup from the data (D7)', () => {
  it('shows the right change count for v2 to v3, and the page holds no img element', async () => {
    const wrapper = await mountApp()

    // data/v3.json, p-exp-reimbursement-1 holds <img src="x" onerror="...">.
    expect(summary(wrapper)).toBe('10 changes')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('onerror')
  })

  it('renders the link of that paragraph as a real link, marked as added', async () => {
    const wrapper = await mountApp()
    const link = wrapper.get('#p-exp-reimbursement-1 ins a')

    expect(link.text()).toBe('expenses portal')
    expect(link.attributes('href')).toBe('https://intranet.example.com/expenses')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders the bold words of that paragraph as bold, with no mark', async () => {
    const wrapper = await mountApp()

    expect(wrapper.get('#p-exp-reimbursement-1 strong').text()).toBe('30 days')
    expect(wrapper.find('#p-exp-reimbursement-1 del').exists()).toBe(false)
  })

  it('renders bold words in a paragraph that did not change', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')
    await target!.setValue('2')
    await base!.setValue('1')

    // v1 and v2 hold the same text for this paragraph, with <b>30 days</b>.
    expect(wrapper.get('#p-exp-reimbursement-1 strong').text()).toBe('30 days')
    expect(wrapper.find('#p-exp-reimbursement-1 ins').exists()).toBe(false)
  })
})

describe('App: changes only (D10)', () => {
  it('folds the unchanged clauses of sec-tools and keeps them in the page', async () => {
    const wrapper = await mountApp()

    expect(wrapper.find('main details').exists()).toBe(false)
    await button(wrapper, 'Changes only').trigger('click')

    // data/v3.json: sec-tools holds 40 clauses. docs/SPEC.md: v2 to v3 edits 4 of them.
    const tools = wrapper.get('#sec-tools')
    expect(tools.findAll('details article')).toHaveLength(36)
    expect(tools.findAll('article')).toHaveLength(40)
    expect(button(wrapper, 'Changes only').attributes('aria-pressed')).toBe('true')
    // An unchanged tool is still in the page, inside a closed fold.
    const slack = wrapper.get('#cl-tool-slack')
    expect(slack.element.closest('details')?.open).toBe(false)
  })

  it('says in each summary how many nodes the fold holds', async () => {
    const wrapper = await mountApp('/?only=1')

    for (const fold of wrapper.get('#sec-tools').findAll('details')) {
      const n = fold.findAll('article').length
      expect(fold.get('summary').text()).toBe(
        n === 1 ? '1 unchanged clause' : `${n} unchanged clauses`,
      )
    }
  })

  it('opens the fold around the target of a link in the outline', async () => {
    const wrapper = await mountApp('/?only=1')

    await wrapper.get('nav[aria-label="Outline"] a[href="#cl-tool-slack"]').trigger('click')

    expect(wrapper.get('#cl-tool-slack').element.closest('details')?.open).toBe(true)
  })
})

describe('App: from change to change', () => {
  it('goes to the first change, then the second, and says where the reader is', async () => {
    const wrapper = await mountApp()

    expect(button(wrapper, 'Previous change').attributes('disabled')).toBeDefined()
    await button(wrapper, 'Next change').trigger('click')

    // docs/SPEC.md, in document order: sec-hours is the first change of v2 to v3.
    expect(summary(wrapper)).toBe('1 of 10')
    expect(location.hash).toBe('#sec-hours')
    expect(document.activeElement?.id).toBe('sec-hours')
    expect(wrapper.get('#sec-hours').classes()).toContain('is-selected')

    await button(wrapper, 'Next change').trigger('click')

    expect(summary(wrapper)).toBe('2 of 10')
    expect(location.hash).toBe('#p-travel-flights-1')
    expect(wrapper.get('#sec-hours').classes()).not.toContain('is-selected')
  })

  it('stops at the last change', async () => {
    const wrapper = await mountApp()

    for (let n = 0; n < 10; n++) await button(wrapper, 'Next change').trigger('click')

    // The last change of v2 to v3 is the added clause in sec-remote.
    expect(summary(wrapper)).toBe('10 of 10')
    expect(location.hash).toBe('#cl-remote-coworking')
    expect(button(wrapper, 'Next change').attributes('disabled')).toBeDefined()
  })
})

describe('App: the address holds the view (US7)', () => {
  it('opens the comparison, the switches and the change that the address names', async () => {
    const wrapper = await mountApp('/?base=1&target=2&only=1&formatting=1#f-exp-equipment-limit')
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    expect(base!.element.value).toBe('1')
    expect(target!.element.value).toBe('2')
    expect(button(wrapper, 'Changes only').attributes('aria-pressed')).toBe('true')
    expect(button(wrapper, 'Show formatting changes').attributes('aria-pressed')).toBe('true')
    await vi.waitFor(() =>
      expect(wrapper.get('#f-exp-equipment-limit').classes()).toContain('is-selected'),
    )
  })

  it('writes each choice of the reader into the address', async () => {
    const wrapper = await mountApp()
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    await vi.waitFor(() => expect(location.search).toBe('?base=2&target=3'))
    await target!.setValue('2')
    await base!.setValue('1')
    await button(wrapper, 'Changes only').trigger('click')

    expect(location.search).toBe('?base=1&target=2&only=1')
  })

  it('falls back to the default for a version that does not exist', async () => {
    const wrapper = await mountApp('/?base=7&target=9')
    const [base, target] = wrapper.findAll<HTMLSelectElement>('header select')

    expect(base!.element.value).toBe('2')
    expect(target!.element.value).toBe('3')
  })

  it('copies the address and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const wrapper = await mountApp('/?base=1&target=3')

    await button(wrapper, 'Copy link').trigger('click')

    expect(writeText).toHaveBeenCalledWith(location.href)
    expect(location.href).toContain('?base=1&target=3')
    await vi.waitFor(() =>
      expect(wrapper.get('header span[role="status"]').text()).toBe('The link is copied.'),
    )
  })

  it('says so when the copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const wrapper = await mountApp()

    await button(wrapper, 'Copy link').trigger('click')

    await vi.waitFor(() =>
      expect(wrapper.get('header span[role="status"]').text()).toBe('The link is not copied.'),
    )
  })
})
