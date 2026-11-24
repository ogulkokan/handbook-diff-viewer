import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import App from './App.vue'

async function mountApp() {
  const wrapper = mount(App)
  // The versions load through dynamic imports, which take more than one tick.
  await vi.waitFor(() => expect(wrapper.find('main').exists()).toBe(true))
  return wrapper
}

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
    expect(wrapper.get('[role="status"]').text()).toBe('10 changes')
    expect(wrapper.findAll('nav[aria-labelledby="changes-heading"] li')).toHaveLength(10)
    expect(wrapper.find('header button').exists()).toBe(false)
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
    expect(wrapper.get('[role="status"]').text()).toBe(
      '12 changes 2 formatting changes are hidden.',
    )
    // The paragraph is in the page, and it shows no mark while formatting changes are hidden.
    expect(wrapper.find('#p-leave-sick-1').exists()).toBe(true)
    expect(wrapper.find('#p-leave-sick-1 del').exists()).toBe(false)
    expect(wrapper.find('#f-exp-equipment-limit del').exists()).toBe(false)

    await wrapper.get('header button').trigger('click')

    expect(wrapper.get('[role="status"]').text()).toBe('14 changes 2 formatting changes are shown.')
    expect(wrapper.get('header button').attributes('aria-pressed')).toBe('true')
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
    expect(wrapper.get('[role="status"]').text()).toBe('10 changes')
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
