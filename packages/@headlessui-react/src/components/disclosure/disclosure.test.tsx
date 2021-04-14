import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import { Disclosure } from './disclosure'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  DisclosureState,
  assertDisclosurePanel,
  assertDisclosureButton,
  getDisclosureButton,
  getDisclosurePanel,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys, MouseButton } from '../../test-utils/interactions'

jest.mock('../../hooks/use-id')

afterAll(() => jest.restoreAllMocks())

describe('Safe guards', () => {
  it.each([
    ['Disclosure.Button', Disclosure.Button],
    ['Disclosure.Panel', Disclosure.Panel],
  ])(
    'should error when we are using a <%s /> without a parent <Disclosure />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Disclosure /> component.`
      )
    })
  )

  it(
    'should be possible to render a Disclosure without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
      )

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Disclosure', () => {
    it(
      'should be possible to render a Disclosure using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button>Trigger</Disclosure.Button>
                <Disclosure.Panel>Panel is: {open ? 'open' : 'closed'}</Disclosure.Panel>
              </>
            )}
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })
      })
    )
  })

  describe('Disclosure.Button', () => {
    it(
      'should be possible to render a Disclosure.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>{JSON.stringify}</Disclosure.Button>
            <Disclosure.Panel></Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    it(
      'should be possible to render a Disclosure.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button as="div" role="button">
              {JSON.stringify}
            </Disclosure.Button>
            <Disclosure.Panel />
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )
  })

  describe('Disclosure.Panel', () => {
    it(
      'should be possible to render Disclosure.Panel using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>{JSON.stringify}</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the Disclosure.Panel if we provide it a `static` prop', () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel static>Contents</Disclosure.Panel>
        </Disclosure>
      )

      // Let's verify that the Disclosure is already there
      expect(getDisclosurePanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Disclosure.Panel', async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel unmount={false}>Contents</Disclosure.Panel>
        </Disclosure>
      )

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })

      // Let's open the Disclosure, to see if it is not hidden anymore
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Let's re-click the Disclosure, to see if it is hidden again
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Disclosure with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the disclosure with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button disabled>Trigger</Disclosure.Button>
            <Disclosure.Panel>Content</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Enter)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Enter when the disclosure is open',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the disclosure with Space',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the disclosure with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button disabled>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Space)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Space when the disclosure is open',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Space)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a disclosure on click',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
      )

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a disclosure on right click',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
      )

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton(), MouseButton.Right)

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a disclosure on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button disabled>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
      )

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Try to open the disclosure
      await click(getDisclosureButton())

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a disclosure on click',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
      )

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })

      // Click to close
      await click(getDisclosureButton())

      // Verify it is closed
      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )
})
