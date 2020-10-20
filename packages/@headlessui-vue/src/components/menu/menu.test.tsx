import { defineComponent, h, nextTick } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { Menu, MenuButton, MenuItems, MenuItem } from './menu'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  MenuState,
  assertMenu,
  assertMenuButton,
  assertMenuButtonLinkedWithMenu,
  assertMenuItem,
  assertMenuLinkedWithMenuItem,
  assertActiveElement,
  assertNoActiveMenuItem,
  getMenuButton,
  getMenu,
  getMenuItems,
  getMenuButtons,
  getMenus,
} from '../../test-utils/accessibility-assertions'
import {
  click,
  focus,
  mouseMove,
  mouseLeave,
  press,
  shift,
  type,
  Keys,
  word,
} from '../../test-utils/interactions'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  const defaultComponents = { Menu, MenuButton, MenuItems, MenuItem }

  if (typeof input === 'string') {
    return render(defineComponent({ template: input, components: defaultComponents }))
  }

  return render(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    )
  )
}

describe('Safe guards', () => {
  it.each([
    ['MenuButton', MenuButton],
    ['MenuItems', MenuItems],
    ['MenuItem', MenuItem],
  ])(
    'should error when we are using a <%s /> without a parent <Menu />',
    suppressConsoleLogs((name, component) => {
      expect(() => render(component)).toThrowError(
        `<${name} /> is missing a parent <Menu /> component.`
      )
    })
  )

  it('should be possible to render a Menu without crashing', () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>Item A</MenuItem>
          <MenuItem>Item B</MenuItem>
          <MenuItem>Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })
})

describe('Rendering', () => {
  describe('Menu', () => {
    it('should be possible to render a Menu using a default render prop', async () => {
      renderTemplate(`
        <Menu v-slot="{ open }">
          <MenuButton>Trigger {{ open ? "visible" : "hidden" }}</MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Visible })
    })

    it('should be possible to render a Menu using a template `as` prop', async () => {
      renderTemplate(`
        <Menu as="template">
          <div>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </div>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
    })

    it(
      'should yell when we render a Menu using a template `as` prop (default) that contains multiple children (if we passthrough props)',
      suppressConsoleLogs(() => {
        expect(() =>
          renderTemplate(`
            <Menu class="relative">
              <MenuButton>Trigger</MenuButton>
              <MenuItems>
                <MenuItem>Item A</MenuItem>
                <MenuItem>Item B</MenuItem>
                <MenuItem>Item C</MenuItem>
              </MenuItems>
            </Menu>
          `)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
        )
      })
    )
  })

  describe('MenuButton', () => {
    it('should be possible to render a MenuButton using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton v-slot="{ open }">
            Trigger {{ open ? "visible" : "hidden" }}
          </MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Visible })
    })

    it('should be possible to render a MenuButton using a template `as` prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton as="template" v-slot="{ open }">
            <button :data-open="open">Trigger</button>
          </MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'false' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'true' },
      })
      assertMenu({ state: MenuState.Visible })
    })

    it(
      'should yell when we render a MenuButton using a template `as` prop that contains multiple children',
      suppressConsoleLogs(() => {
        expect(() =>
          renderTemplate(`
            <Menu>
              <MenuButton as="template">
                <span>Trigger</span>
                <svg />
              </MenuButton>
              <MenuItems>
                <MenuItem>Item A</MenuItem>
                <MenuItem>Item B</MenuItem>
                <MenuItem>Item C</MenuItem>
              </MenuItems>
            </Menu>
          `)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
        )
      })
    )
  })

  describe('MenuItems', () => {
    it('should be possible to render MenuItems using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems v-slot="{ open }">
            <span>{{ open ? "visible" : "hidden" }}</span>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      expect(getMenu()?.firstChild?.textContent).toBe('visible')
    })

    it('should be possible to render MenuItems using a template `as` prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems as="template" v-slot="{ open }">
            <div :data-open="open">
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </div>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible, attributes: { 'data-open': 'true' } })
    })

    it('should yell when we render MenuItems using a template `as` prop that contains multiple children', async () => {
      const state = {
        resolve(_value: Error | PromiseLike<Error>) {},
        done(error: unknown) {
          state.resolve(error as Error)
          return true
        },
        promise: new Promise<Error>(() => {}),
      }

      state.promise = new Promise<Error>(resolve => {
        state.resolve = resolve
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems as="template">
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured: state.done,
      })

      await click(getMenuButton())
      const error = await state.promise
      expect(error.message).toMatchInlineSnapshot(
        `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
      )
    })

    it('should be possible to always render the MenuItems if we provide it a `static` prop', () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems static>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Let's verify that the Menu is already there
      expect(getMenu()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the MenuItems', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems :unmount="false">
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      await new Promise<void>(nextTick)

      assertMenu({ state: MenuState.InvisibleHidden })

      // Let's open the Menu, to see if it is not hidden anymore
      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })
    })
  })

  describe('MenuItem', () => {
    it('should be possible to render MenuItem using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem v-slot="{ active, disabled }">
              <span>Item A - {{ JSON.stringify({ active, disabled }) }}</span>
            </MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      expect(getMenuItems()[0]?.textContent).toBe(
        `Item A - ${JSON.stringify({ active: false, disabled: false })}`
      )
    })

    it('should be possible to render a MenuItem using a template `as` prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item A</a>
            </MenuItem>
            <MenuItem as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item B</a>
            </MenuItem>
            <MenuItem disabled as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item C</a>
            </MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      getMenuButton()?.focus()

      await press(Keys.Enter)

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      assertMenuItem(getMenuItems()[0], {
        tag: 'a',
        attributes: { 'data-active': 'true', 'data-disabled': 'false' },
      })
      assertMenuItem(getMenuItems()[1], {
        tag: 'a',
        attributes: { 'data-active': 'false', 'data-disabled': 'false' },
      })
      assertMenuItem(getMenuItems()[2], {
        tag: 'a',
        attributes: { 'data-active': 'false', 'data-disabled': 'true' },
      })
    })

    it('should yell when we render a MenuItem using a template `as` prop that contains multiple children', async () => {
      const state = {
        resolve(_value: Error | PromiseLike<Error>) {},
        done(error: unknown) {
          state.resolve(error as Error)
          return true
        },
        promise: new Promise<Error>(() => {}),
      }

      state.promise = new Promise<Error>(resolve => {
        state.resolve = resolve
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>
                <span>Item A</span>
                <svg />
              </MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured: state.done,
      })

      await click(getMenuButton())
      const error = await state.promise
      expect(error.message).toMatchInlineSnapshot(
        `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
      )
    })
  })
})

describe('Rendering composition', () => {
  it('should be possible to conditionally render classNames (aka className can be a function?!)', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a" :className="JSON.stringify">Item A</MenuItem>
          <MenuItem as="a" disabled :className="JSON.stringify">Item B</MenuItem>
          <MenuItem as="a" class="no-special-treatment">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // Verify correct classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that nothing is active
    assertNoActiveMenuItem()

    // Make the first item active
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: true, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the first item is the active one
    assertMenuLinkedWithMenuItem(items[0])

    // Let's go down, this should go to the third item since the second item is disabled!
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the last item is the active one
    assertMenuLinkedWithMenuItem(items[2])
  })

  it(
    'should be possible to swap the menu item with a button for example',
    suppressConsoleLogs(async () => {
      const MyButton = defineComponent({
        setup(props) {
          return () => h('button', { 'data-my-custom-button': true, ...props })
        },
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem :as="MyButton">Item A</MenuItem>
              <MenuItem :as="MyButton">Item B</MenuItem>
              <MenuItem :as="MyButton">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        setup: () => ({ MyButton }),
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      const items = getMenuItems()
      items.forEach(item =>
        assertMenuItem(item, { tag: 'button', attributes: { 'data-my-custom-button': 'true' } })
      )
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it('should be possible to open the menu with Enter', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with Enter when the button is disabled', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.Enter)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should focus the first non disabled menu item when opening with Enter', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item upon Enter key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      assertNoActiveMenuItem()
    })

    it('should be possible to close the menu with Enter when there is no active menuitem', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })

      // Close menu
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })

    it('should be possible to close the menu with Enter and invoke the active menu item', async () => {
      const clickHandler = jest.fn()
      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a" @click="clickHandler">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        setup: () => ({ clickHandler }),
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })

      // Activate the first menu item
      const items = getMenuItems()
      await mouseMove(items[0])

      // Close menu, and invoke the item
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())

      // Verify the "click" went through on the `a` tag
      expect(clickHandler).toHaveBeenCalled()
    })
  })

  it('should be possible to use a button as a menu item and invoke it upon Enter', async () => {
    const clickHandler = jest.fn()

    renderTemplate({
      template: `
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="button" @click="clickHandler">
              Item B
            </MenuItem>
            <MenuItem>
              <button @click="clickHandler">Item C</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })

    // Activate the second menu item
    const items = getMenuItems()
    await mouseMove(items[1])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify it is closed
    assertMenuButton({ state: MenuState.InvisibleUnmounted })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Verify the button is focused again
    assertActiveElement(getMenuButton())

    // Click the menu button again
    await click(getMenuButton())

    // Active the last menu item
    await mouseMove(getMenuItems()[2])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(2)

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  describe('`Space` key', () => {
    it('should be possible to open the menu with Space', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with Space when the button is disabled', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.Space)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should focus the first non disabled menu item when opening with Space', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item upon Space key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      assertNoActiveMenuItem()
    })

    it(
      'should be possible to close the menu with Space when there is no active menuitem',
      suppressConsoleLogs(async () => {
        renderTemplate(`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </Menu>
        `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Close menu
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to close the menu with Space and invoke the active menu item',
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn()
        renderTemplate({
          template: `
            <Menu>
              <MenuButton>Trigger</MenuButton>
              <MenuItems>
                <MenuItem as="a" @click="clickHandler">Item A</MenuItem>
                <MenuItem as="a">Item B</MenuItem>
                <MenuItem as="a">Item C</MenuItem>
              </MenuItems>
            </Menu>
          `,
          setup: () => ({ clickHandler }),
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Activate the first menu item
        const items = getMenuItems()
        await mouseMove(items[0])

        // Close menu, and invoke the item
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled()

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )
  })

  describe('`Escape` key', () => {
    it('should be possible to close an open menu with Escape', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Close menu
      await press(Keys.Escape)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })
  })

  describe('`Tab` key', () => {
    it('should focus trap when we use Tab', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // Try to tab
      await press(Keys.Tab)

      // Verify it is still open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({ state: MenuState.Visible })
    })

    it('should focus trap when we use Shift+Tab', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // Try to Shift+Tab
      await press(shift(Keys.Tab))

      // Verify it is still open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({ state: MenuState.Visible })
    })
  })

  describe('`ArrowDown` key', () => {
    it('should be possible to open the menu with ArrowDown', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with ArrowDown when the button is disabled', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.ArrowDown)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should be possible to use ArrowDown to navigate the menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down again
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])

      // We should NOT be able to go down again (because last item). Current implementation won't go around.
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and skip the first disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])
    })
  })

  describe('`ArrowUp` key', () => {
    it('should be possible to open the menu with ArrowUp and the last item should be active', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // ! ALERT: The LAST item should now be active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to navigate up or down if there is only a single non-disabled item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go up (because those are disabled)
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go down (because this is the last item)
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowUp to navigate the menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go down once
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down again
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[0])

      // We should NOT be able to go up again (because first item). Current implementation won't go around.
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[0])
    })
  })

  describe('`End` key', () => {
    it('should be possible to use the End key to go to the last menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the End key to go to the last non disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should be possible to use the End key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.End)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should have no active menu item upon End key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.End)

      assertNoActiveMenuItem()
    })
  })

  describe('`PageDown` key', () => {
    it('should be possible to use the PageDown key to go to the last menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the PageDown key to go to the last non disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should be possible to use the PageDown key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageDown)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should have no active menu item upon PageDown key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageDown)

      assertNoActiveMenuItem()
    })
  })

  describe('`Home` key', () => {
    it('should be possible to use the Home key to go to the first menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the first item
      await press(Keys.Home)
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should be possible to use the Home key to go to the first non disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      const items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[3])
    })

    it('should have no active menu item upon Home key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      assertNoActiveMenuItem()
    })
  })

  describe('`PageUp` key', () => {
    it('should be possible to use the PageUp key to go to the first menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the first item
      await press(Keys.PageUp)
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should be possible to use the PageUp key to go to the first non disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      const items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[3])
    })

    it('should have no active menu item upon PageUp key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      assertNoActiveMenuItem()
    })
  })

  describe('`Any` key aka search', () => {
    it('should be possible to type a full word that has a perfect match', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      const items = getMenuItems()

      // We should be able to go to the second item
      await type(word('bob'))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first item
      await type(word('alice'))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await type(word('charlie'))
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to type a partial of a word', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the second item
      await type(word('bo'))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first item
      await type(word('ali'))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await type(word('char'))
      assertMenuLinkedWithMenuItem(items[2])
    })

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        renderTemplate(`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">value a</MenuItem>
              <MenuItem as="a">value b</MenuItem>
              <MenuItem as="a">value c</MenuItem>
            </MenuItems>
          </Menu>
        `)

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        const items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the second item
        await type(word('value b'))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go to the first item
        await type(word('value a'))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await type(word('value c'))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it('should not be possible to search for a disabled item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a" disabled>bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go to the disabled item
      await type(word('bo'))

      // We should still be on the last item
      assertMenuLinkedWithMenuItem(items[2])
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to open a menu on click', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })
    assertMenu({
      state: MenuState.Visible,
      attributes: { id: 'headlessui-menu-items-2' },
    })
    assertMenuButtonLinkedWithMenu()

    // Verify we have menu items
    const items = getMenuItems()
    expect(items).toHaveLength(3)
    items.forEach(item => assertMenuItem(item))
  })

  it('should not be possible to open a menu on click when the button is disabled', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton disabled>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Try to open the menu
    await click(getMenuButton())

    // Verify it is still closed
    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be possible to close a menu on click', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>Item A</MenuItem>
          <MenuItem>Item B</MenuItem>
          <MenuItem>Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })

    // Click to close
    await click(getMenuButton())

    // Verify it is closed
    assertMenuButton({ state: MenuState.InvisibleUnmounted })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be a no-op when we click outside of a closed menu', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Verify that the window is closed
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Click something that is not related to the menu
    await click(document.body)

    // Should still be closed
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be possible to click outside of the menu which should close the menu', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // Click something that is not related to the menu
    await click(document.body)

    // Should be closed now
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  it('should be possible to click outside of the menu which should close the menu (even if we press the menu button)', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // Click the menu button again
    await click(getMenuButton())

    // Should be closed now
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  it(
    'should be possible to click outside of the menu on another menu button which should close the current menu and open the new menu',
    suppressConsoleLogs(async () => {
      renderTemplate(`
        <div>
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>alice</MenuItem>
              <MenuItem>bob</MenuItem>
              <MenuItem>charlie</MenuItem>
            </MenuItems>
          </Menu>

          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>alice</MenuItem>
              <MenuItem>bob</MenuItem>
              <MenuItem>charlie</MenuItem>
            </MenuItems>
          </Menu>
        </div>
      `)

      const [button1, button2] = getMenuButtons()

      // Click the first menu button
      await click(button1)
      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the first button
      assertMenuButtonLinkedWithMenu(button1, getMenu())

      // Click the second menu button
      await click(button2)

      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the second button
      assertMenuButtonLinkedWithMenu(button2, getMenu())
    })
  )

  it('should be possible to hover an item and make it active', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()
    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    // We should be able to go to the first item
    await mouseMove(items[0])
    assertMenuLinkedWithMenuItem(items[0])

    // We should be able to go to the last item
    await mouseMove(items[2])
    assertMenuLinkedWithMenuItem(items[2])
  })

  it('should make a menu item active when you move the mouse over it', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()
    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is already active', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    await mouseMove(items[1])

    // Nothing should be changed
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is disabled', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    await mouseMove(items[1])
    assertNoActiveMenuItem()
  })

  it('should not be possible to hover an item that is disabled', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await mouseMove(items[1])

    // We should not have an active item now
    assertNoActiveMenuItem()
  })

  it('should be possible to mouse leave an item and make it inactive', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    await mouseLeave(items[1])
    assertNoActiveMenuItem()

    // We should be able to go to the first item
    await mouseMove(items[0])
    assertMenuLinkedWithMenuItem(items[0])

    await mouseLeave(items[0])
    assertNoActiveMenuItem()

    // We should be able to go to the last item
    await mouseMove(items[2])
    assertMenuLinkedWithMenuItem(items[2])

    await mouseLeave(items[2])
    assertNoActiveMenuItem()
  })

  it('should be possible to mouse leave a disabled item and be a no-op', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await mouseMove(items[1])
    assertNoActiveMenuItem()

    await mouseLeave(items[1])
    assertNoActiveMenuItem()
  })

  it('should be possible to click a menu item, which closes the menu', async () => {
    const clickHandler = jest.fn()
    renderTemplate({
      template: `
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a" @click="clickHandler">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    const items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])

    assertMenu({ state: MenuState.InvisibleUnmounted })
    expect(clickHandler).toHaveBeenCalled()
  })

  it('should be possible to click a menu item, which closes the menu and invokes the @click handler', async () => {
    const clickHandler = jest.fn()
    renderTemplate({
      template: `
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="button" @click="clickHandler">bob</MenuItem>
            <MenuItem>
              <button @click="clickHandler">charlie</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // We should be able to click the first item
    await click(getMenuItems()[1])
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Let's re-open the window for now
    await click(getMenuButton())

    // Click the last item, which should close and invoke the handler
    await click(getMenuItems()[2])
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(2)
  })

  it('should be possible to click a disabled menu item, which is a no-op', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    const items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])
    assertMenu({ state: MenuState.Visible })
  })

  it('should be possible focus a menu item, so that it becomes active', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    const items = getMenuItems()

    // Verify that nothing is active yet
    assertNoActiveMenuItem()

    // We should be able to focus the first item
    await focus(items[1])
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should not be possible to focus a menu item which is disabled', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    const items = getMenuItems()

    // We should not be able to focus the first item
    await focus(items[1])
    assertNoActiveMenuItem()
  })

  it('should not be possible to activate a disabled item', async () => {
    const clickHandler = jest.fn()

    renderTemplate({
      template: `
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" @click="clickHandler">alice</MenuItem>
            <MenuItem as="a" @click="clickHandler" disabled>
              bob
            </MenuItem>
            <MenuItem>
              <button @click="clickHandler">charlie</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    const items = getMenuItems()

    await focus(items[0])
    await focus(items[1])
    await press(Keys.Enter)
    expect(clickHandler).not.toHaveBeenCalled()

    // Activate the last item
    await focus(items[2])
    await press(Keys.Enter)
    expect(clickHandler).not.toHaveBeenCalled()
  })
})
