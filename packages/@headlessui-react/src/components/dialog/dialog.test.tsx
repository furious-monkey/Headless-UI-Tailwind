import React, { createElement, useState } from 'react'
import { render } from '@testing-library/react'

import { Dialog } from './dialog'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  DialogState,
  assertDialog,
  assertDialogDescription,
  assertDialogOverlay,
  assertDialogTitle,
  getDialog,
  getDialogOverlay,
  getByText,
  assertActiveElement,
  getDialogs,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys } from '../../test-utils/interactions'
import { PropsOf } from '../../types'

jest.mock('../../hooks/use-id')

// @ts-expect-error
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() {}
  disconnect() {}
}

afterAll(() => jest.restoreAllMocks())

function TabSentinel(props: PropsOf<'div'>) {
  return <div tabIndex={0} {...props} />
}

describe('Safe guards', () => {
  it.each([
    ['Dialog.Overlay', Dialog.Overlay],
    ['Dialog.Title', Dialog.Title],
  ])(
    'should error when we are using a <%s /> without a parent <Dialog />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Dialog /> component.`
      )
      expect.hasAssertions()
    })
  )

  it(
    'should be possible to render a Dialog without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Dialog open={false} onClose={console.log}>
          <button>Trigger</button>
          <Dialog.Overlay />
          <Dialog.Title />
          <p>Contents</p>
          <Dialog.Description />
        </Dialog>
      )

      assertDialog({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-1' },
      })
    })
  )
})

describe('Rendering', () => {
  describe('Dialog', () => {
    it(
      'should complain when the `open` and `onClose` prop are missing',
      suppressConsoleLogs(async () => {
        // @ts-expect-error
        expect(() => render(<Dialog as="div" />)).toThrowErrorMatchingInlineSnapshot(
          `"You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `open` prop is provided without an `onClose` prop',
      suppressConsoleLogs(async () => {
        // @ts-expect-error
        expect(() => render(<Dialog as="div" open={false} />)).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `onClose` prop is provided without an `open` prop',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog as="div" onClose={() => {}} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `open` prop is not a boolean',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog as="div" open={null} onClose={console.log} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `onClose` prop is not a function',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog as="div" open={false} onClose={null} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should be possible to render a Dialog using a render prop',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(true)}>
                Trigger
              </button>
              <Dialog open={isOpen} onClose={setIsOpen}>
                {data => (
                  <>
                    <pre>{JSON.stringify(data)}</pre>
                    <TabSentinel />
                  </>
                )}
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        assertDialog({ state: DialogState.Visible, textContent: JSON.stringify({ open: true }) })
      })
    )

    it('should be possible to always render the Dialog if we provide it a `static` prop (and enable focus trapping based on `open`)', () => {
      let focusCounter = jest.fn()
      render(
        <>
          <button>Trigger</button>
          <Dialog open={true} onClose={console.log} static>
            <p>Contents</p>
            <TabSentinel onFocus={focusCounter} />
          </Dialog>
        </>
      )

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(1)
    })

    it('should be possible to always render the Dialog if we provide it a `static` prop (and disable focus trapping based on `open`)', () => {
      let focusCounter = jest.fn()
      render(
        <>
          <button>Trigger</button>
          <Dialog open={false} onClose={console.log} static>
            <p>Contents</p>
            <TabSentinel onFocus={focusCounter} />
          </Dialog>
        </>
      )

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(0)
    })

    it('should be possible to use a different render strategy for the Dialog', async () => {
      let focusCounter = jest.fn()
      function Example() {
        let [isOpen, setIsOpen] = useState(false)

        return (
          <>
            <button id="trigger" onClick={() => setIsOpen(v => !v)}>
              Trigger
            </button>
            <Dialog open={isOpen} onClose={setIsOpen} unmount={false}>
              <input onFocus={focusCounter} />
            </Dialog>
          </>
        )
      }
      render(<Example />)

      assertDialog({ state: DialogState.InvisibleHidden })
      expect(focusCounter).toHaveBeenCalledTimes(0)

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(document.getElementById('trigger'))
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.Visible })

      // Let's close the Dialog
      await press(Keys.Escape)
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.InvisibleHidden })
    })

    it(
      'should add a scroll lock to the html tag',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(v => !v)}>
                Trigger
              </button>

              <Dialog open={isOpen} onClose={setIsOpen}>
                <input id="a" type="text" />
                <input id="b" type="text" />
                <input id="c" type="text" />
              </Dialog>
            </>
          )
        }

        render(<Example />)

        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let btn = document.getElementById('trigger')

        // Open the dialog
        await click(btn)

        // Expect overflow
        expect(document.documentElement.style.overflow).toBe('hidden')
      })
    )
  })

  describe('Dialog.Overlay', () => {
    it(
      'should be possible to render Dialog.Overlay using a render prop',
      suppressConsoleLogs(async () => {
        let overlay = jest.fn().mockReturnValue(null)
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(v => !v)}>
                Trigger
              </button>
              <Dialog open={isOpen} onClose={setIsOpen}>
                <Dialog.Overlay>{overlay}</Dialog.Overlay>
                <TabSentinel />
              </Dialog>
            </>
          )
        }

        render(<Example />)

        assertDialogOverlay({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-overlay-2' },
        })

        await click(document.getElementById('trigger'))

        assertDialogOverlay({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-overlay-2' },
        })
        expect(overlay).toHaveBeenCalledWith({ open: true })
      })
    )
  })

  describe('Dialog.Title', () => {
    it(
      'should be possible to render Dialog.Title using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog open={true} onClose={console.log}>
            <Dialog.Title>{JSON.stringify}</Dialog.Title>
            <TabSentinel />
          </Dialog>
        )

        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })
        assertDialogTitle({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })

  describe('Dialog.Description', () => {
    it(
      'should be possible to render Dialog.Description using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog open={true} onClose={console.log}>
            <Dialog.Description>{JSON.stringify}</Dialog.Description>
            <TabSentinel />
          </Dialog>
        )

        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })
        assertDialogDescription({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })
})

describe('Keyboard interactions', () => {
  describe('`Escape` key', () => {
    it(
      'should be possible to close the dialog with Escape',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(v => !v)}>
                Trigger
              </button>
              <Dialog open={isOpen} onClose={setIsOpen}>
                Contents
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to close a Dialog using a click on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button id="trigger" onClick={() => setIsOpen(v => !v)}>
              Trigger
            </button>
            <Dialog open={isOpen} onClose={setIsOpen}>
              <Dialog.Overlay />
              Contents
              <TabSentinel />
            </Dialog>
          </>
        )
      }
      render(<Example />)

      // Open dialog
      await click(document.getElementById('trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click to close
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the dialog, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button onClick={() => setIsOpen(v => !v)}>Trigger</button>
            <Dialog open={isOpen} onClose={setIsOpen}>
              Contents
              <TabSentinel />
            </Dialog>
          </>
        )
      }
      render(<Example />)

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the body to close
      await click(document.body)

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Trigger'))
    })
  )

  it(
    'should be possible to close the dialog, and keep focus on the focusable element',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button>Hello</button>
            <button onClick={() => setIsOpen(v => !v)}>Trigger</button>
            <Dialog open={isOpen} onClose={setIsOpen}>
              Contents
              <TabSentinel />
            </Dialog>
          </>
        )
      }
      render(<Example />)

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button to close (outside click)
      await click(getByText('Hello'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Hello'))
    })
  )

  it(
    'should stop propagating click events when clicking on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        return (
          <div onClick={wrapperFn}>
            <Dialog open={isOpen} onClose={setIsOpen}>
              Contents
              <Dialog.Overlay />
              <TabSentinel />
            </Dialog>
          </div>
        )
      }
      render(<Example />)

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the Dialog.Overlay to close the Dialog
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )

  it(
    'should stop propagating click events when clicking on an element inside the Dialog',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        return (
          <div onClick={wrapperFn}>
            <Dialog open={isOpen} onClose={setIsOpen}>
              Contents
              <button onClick={() => setIsOpen(false)}>Inside</button>
              <TabSentinel />
            </Dialog>
          </div>
        )
      }
      render(<Example />)

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the button inside the the Dialog
      await click(getByText('Inside'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )
})

describe('Nesting', () => {
  it('should be possible to open nested Dialog components and close them with `Escape`', async () => {
    function Nested({ onClose, level = 1 }: { onClose: (value: boolean) => void; level?: number }) {
      let [showChild, setShowChild] = useState(false)

      return (
        <>
          <Dialog open={true} onClose={onClose}>
            <div>
              <p>Level: {level}</p>
              <button onClick={() => setShowChild(true)}>Open {level + 1}</button>
            </div>
            {showChild && <Nested onClose={setShowChild} level={level + 1} />}
          </Dialog>
        </>
      )
    }

    function Example() {
      let [open, setOpen] = useState(false)

      return (
        <>
          <button onClick={() => setOpen(true)}>Open 1</button>
          {open && <Nested onClose={setOpen} />}
        </>
      )
    }

    render(<Example />)

    // Verify we have no open dialogs
    expect(getDialogs()).toHaveLength(0)

    // Open Dialog 1
    await click(getByText('Open 1'))

    // Verify that we have 1 open dialog
    expect(getDialogs()).toHaveLength(1)

    // Open Dialog 2
    await click(getByText('Open 2'))

    // Verify that we have 2 open dialogs
    expect(getDialogs()).toHaveLength(2)

    // Press escape to close the top most Dialog
    await press(Keys.Escape)

    // Verify that we have 1 open dialog
    expect(getDialogs()).toHaveLength(1)

    // Open Dialog 2
    await click(getByText('Open 2'))

    // Verify that we have 2 open dialogs
    expect(getDialogs()).toHaveLength(2)

    // Open Dialog 3
    await click(getByText('Open 3'))

    // Verify that we have 3 open dialogs
    expect(getDialogs()).toHaveLength(3)

    // Press escape to close the top most Dialog
    await press(Keys.Escape)

    // Verify that we have 2 open dialogs
    expect(getDialogs()).toHaveLength(2)

    // Press escape to close the top most Dialog
    await press(Keys.Escape)

    // Verify that we have 1 open dialog
    expect(getDialogs()).toHaveLength(1)
  })
})
