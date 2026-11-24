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
    expect(wrapper.find('#p-leave-sick-1 del').exists()).toBe(false)

    await wrapper.get('header button').trigger('click')

    expect(wrapper.get('[role="status"]').text()).toBe('14 changes 2 formatting changes are shown.')
    expect(wrapper.get('header button').attributes('aria-pressed')).toBe('true')
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
