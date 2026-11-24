import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import App from './App.vue'

describe('App', () => {
  it('shows the name of the app in the main heading', () => {
    const wrapper = mount(App)

    expect(wrapper.get('main h1').text()).toBe('Handbook diff viewer')
  })
})
