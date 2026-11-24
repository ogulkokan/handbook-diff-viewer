import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import App from './App.vue'

describe('App', () => {
  it('shows the latest version with its outline and its sections', async () => {
    const wrapper = mount(App)

    // The versions load through dynamic imports, which take more than one tick.
    await vi.waitFor(() => expect(wrapper.find('main').exists()).toBe(true))

    // data/v3.json: the title, 8 top sections and the nested section sec-travel.
    expect(wrapper.get('h1').text()).toBe('Team Handbook')
    expect(wrapper.get('select').element.value).toBe('3')
    expect(wrapper.findAll('main section')).toHaveLength(9)
    expect(wrapper.get('nav[aria-label="Outline"] a[href="#sec-remote"]').text()).toBe(
      'Remote Work',
    )
    expect(wrapper.get('#sec-expenses #sec-travel h3').text()).toBe('Travel')
  })
})
