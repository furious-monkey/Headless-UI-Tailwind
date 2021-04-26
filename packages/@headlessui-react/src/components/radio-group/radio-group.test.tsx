import React, { createElement, useState } from 'react'
import { render } from '@testing-library/react'

import { RadioGroup } from './radio-group'

import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { press, Keys, shift, click } from '../../test-utils/interactions'
import {
  getByText,
  assertRadioGroupLabel,
  getRadioGroupOptions,
  assertFocusable,
  assertNotFocusable,
  assertActiveElement,
} from '../../test-utils/accessibility-assertions'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

describe('Safe guards', () => {
  it.each([['RadioGroup.Option', RadioGroup.Option]])(
    'should error when we are using a <%s /> without a parent <RadioGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <RadioGroup /> component.`
      )
    })
  )

  it(
    'should be possible to render a RadioGroup without crashing',
    suppressConsoleLogs(async () => {
      render(
        <RadioGroup value={undefined} onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      assertRadioGroupLabel({ textContent: 'Pizza Delivery' })
    })
  )

  it('should be possible to render a RadioGroup without options and without crashing', () => {
    render(<RadioGroup value={undefined} onChange={console.log} />)
  })
})

describe('Rendering', () => {
  it('should be possible to render a RadioGroup, where the first element is tabbable (value is undefined)', async () => {
    render(
      <RadioGroup value={undefined} onChange={console.log}>
        <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
        <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
        <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
        <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
      </RadioGroup>
    )

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup, where the first element is tabbable (value is null)', async () => {
    render(
      <RadioGroup value={null} onChange={console.log}>
        <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
        <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
        <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
        <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
      </RadioGroup>
    )

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup with an active value', async () => {
    render(
      <RadioGroup value="home-delivery" onChange={console.log}>
        <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
        <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
        <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
        <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
      </RadioGroup>
    )

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertNotFocusable(getByText('Pickup'))
    assertFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should guarantee the radio option order after a few unmounts', async () => {
    function Example() {
      let [showFirst, setShowFirst] = useState(false)
      let [active, setActive] = useState()

      return (
        <>
          <button onClick={() => setShowFirst(v => !v)}>Toggle</button>
          <RadioGroup value={active} onChange={setActive}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            {showFirst && <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>}
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
        </>
      )
    }

    render(<Example />)

    await click(getByText('Toggle')) // Render the pickup again

    await press(Keys.Tab) // Focus first element
    assertActiveElement(getByText('Pickup'))

    await press(Keys.ArrowUp) // Loop around
    assertActiveElement(getByText('Dine in'))

    await press(Keys.ArrowUp) // Up again
    assertActiveElement(getByText('Home delivery'))
  })

  it('should be possible to disable a RadioGroup', async () => {
    let changeFn = jest.fn()

    function Example() {
      let [disabled, setDisabled] = useState(true)
      return (
        <>
          <button onClick={() => setDisabled(v => !v)}>Toggle</button>
          <RadioGroup value={undefined} onChange={changeFn} disabled={disabled}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            <RadioGroup.Option value="render-prop" data-value="render-prop">
              {JSON.stringify}
            </RadioGroup.Option>
          </RadioGroup>
        </>
      )
    }

    render(<Example />)

    // Try to click one a few options
    await click(getByText('Pickup'))
    await click(getByText('Dine in'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the onChange handler never got called
    expect(changeFn).toHaveBeenCalledTimes(0)

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(getByText('Pickup'))

    // Make sure that the onChange handler got called
    expect(changeFn).toHaveBeenCalledTimes(1)
  })

  it('should be possible to disable a RadioGroup.Option', async () => {
    let changeFn = jest.fn()

    function Example() {
      let [disabled, setDisabled] = useState(true)
      return (
        <>
          <button onClick={() => setDisabled(v => !v)}>Toggle</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            <RadioGroup.Option value="render-prop" disabled={disabled} data-value="render-prop">
              {JSON.stringify}
            </RadioGroup.Option>
          </RadioGroup>
        </>
      )
    }

    render(<Example />)

    // Try to click the disabled option
    await click(document.querySelector('[data-value="render-prop"]'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the onChange handler never got called
    expect(changeFn).toHaveBeenCalledTimes(0)

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(document.querySelector('[data-value="render-prop"]'))

    // Make sure that the onChange handler got called
    expect(changeFn).toHaveBeenCalledTimes(1)
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      render(
        <RadioGroup value={undefined} onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      render(
        <RadioGroup value={undefined} onChange={changeFn}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab to the active item', async () => {
      render(
        <RadioGroup value="home-delivery" onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      render(
        <RadioGroup value="home-delivery" onChange={changeFn}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Pickup'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      render(
        <>
          <button>Before</button>
          <RadioGroup value="home-delivery" onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })
  })

  describe('`Shift+Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      render(
        <>
          <RadioGroup value={undefined} onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab to the active item', async () => {
      render(
        <>
          <RadioGroup value="home-delivery" onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <RadioGroup value="home-delivery" onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Pickup'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      render(
        <>
          <button>Before</button>
          <RadioGroup value="home-delivery" onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Home delivery'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })
  })

  describe('`ArrowLeft` key', () => {
    it('should go to the previous item when pressing the ArrowLeft key', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowLeft) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowLeft)
      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
    })
  })

  describe('`ArrowUp` key', () => {
    it('should go to the previous item when pressing the ArrowUp key', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowUp) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowUp)
      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
    })
  })

  describe('`ArrowRight` key', () => {
    it('should go to the next item when pressing the ArrowRight key', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowRight) // Loop around
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
    })
  })

  describe('`ArrowDown` key', () => {
    it('should go to the next item when pressing the ArrowDown key', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowDown) // Loop around
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
    })
  })

  describe('`Space` key', () => {
    it('should select the current option when pressing space', async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(1)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
    })

    it('should select the current option only once when pressing space', async () => {
      let changeFn = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <>
            <button>Before</button>
            <RadioGroup
              value={value}
              onChange={v => {
                setValue(v)
                changeFn(v)
              }}
            >
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )
      }
      render(<Example />)

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(1)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to change the current radio group value when clicking on a radio option', async () => {
    let changeFn = jest.fn()
    render(
      <>
        <button>Before</button>
        <RadioGroup value={undefined} onChange={changeFn}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
        <button>After</button>
      </>
    )

    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
  })

  it('should be a no-op when clicking on the same item', async () => {
    let changeFn = jest.fn()
    function Example() {
      let [value, setValue] = useState(undefined)

      return (
        <>
          <button>Before</button>
          <RadioGroup
            value={value}
            onChange={v => {
              setValue(v)
              changeFn(v)
            }}
          >
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )
    }
    render(<Example />)

    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    expect(changeFn).toHaveBeenCalledTimes(1)
  })
})
