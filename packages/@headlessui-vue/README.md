<h3 align="center">
  @headlessui/vue
</h3>

<p align="center">
  A set of completely unstyled, fully accessible UI components for Vue 3, designed to integrate
  beautifully with Tailwind CSS.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@headlessui/vue"><img src="https://img.shields.io/npm/dt/@headlessui/vue.svg" alt="Total Downloads"></a>
  <a href="https://github.com/tailwindlabs/headlessui/releases"><img src="https://img.shields.io/npm/v/@headlessui/vue.svg" alt="Latest Release"></a>
  <a href="https://github.com/tailwindlabs/headlessui/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@headlessui/vue.svg" alt="License"></a>
</p>

## Installation

Please note that **this library only supports Vue 3**.

```sh
# npm
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

## Components

_This project is still in early development. New components will be added regularly over the coming months._

- [Menu Button (Dropdown)](#menu-button-dropdown)
- [Listbox](#listbox)

### Roadmap

This project is still in early development, but the plan is to build out all of the primitives we need to provide interactive Vue examples of all of the components included in [Tailwind UI](https://tailwindui.com), the commercial component directory that helps us fund the development of our open-source work like [Tailwind CSS](https://tailwindcss.com).

This includes things like:

- Listboxes
- Toggles
- Modals
- Tabs
- Slide-overs
- Mobile menus
- Accordions

...and more in the future.

We'll be continuing to develop new components on an on-going basis, with a goal of reaching a pretty fleshed out v1.0 by the end of the year.

---

## Menu Button (Dropdown)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuivue-menu-example-70br3?file=/src/App.vue)

The `Menu` component and related child components are used to quickly build custom dropdown components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Basic example](#basic-example)
- [Styling](#styling)
- [Transitions](#transitions)
- [Component API](#component-api)

### Basic example

Menu Buttons are built using the `Menu`, `MenuButton`, `MenuItems`, and `MenuItem` components.

The `MenuButton` will automatically open/close the `MenuItems` when clicked, and when the menu is open, the list of items receives focus and is automatically navigable via the keyboard.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>
    <MenuItems>
      <MenuItem v-slot="{ active }">
        <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Account settings </a>
      </MenuItem>
      <MenuItem v-slot="{ active }">
        <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Documentation </a>
      </MenuItem>
      <MenuItem v-slot="{ active }" disabled>
        <span :class="{ 'bg-blue-500': active }"> Invite a friend (coming soon!) </span>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>

<script>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

export default {
  components: {
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
  },
}
</script>
```

### Styling the active item

This is a headless component so there are no styles included by default. Instead, the components expose useful information via [scoped slots](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) that you can use to apply the styles you'd like to apply yourself.

To style the active `MenuItem` you can read the `active` slot prop, which tells you whether or not that menu item is the item that is currently focused via the mouse or keyboard.

You can use this state to conditionally apply whatever active/focus styles you like, for instance a blue background like is typical in most operating systems.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>
    <MenuItems>
      <!-- Use the `active` state to conditionally style the active item. -->
      <MenuItem v-slot="{ active }">
        <a href="/settings" :class="active ? 'bg-blue-500 text-white' : 'bg-white text-black'">
          Settings
        </a>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

### Showing/hiding the menu

By default, your `MenuItems` instance will be shown/hidden automatically based on the internal `open` state tracked within the `Menu` component itself.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>

    <!-- By default, this will automatically show/hide when the MenuButton is pressed. -->
    <MenuItems>
      <MenuItem v-slot="{ active }">
        <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Account settings </a>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

If you'd rather handle this yourself (perhaps because you need to add an extra wrapper element for one reason or another), you can add a `static` prop to the `MenuItems` instance to tell it to always render, and inspect the `open` slot prop provided by the `Menu` to control which element is shown/hidden yourself.

```vue
<template>
  <Menu v-slot="{ open }">
    <MenuButton> More </MenuButton>

    <div v-show="open">
      <!-- Using `static`, `MenuItems` is always rendered and ignores the `open` state. -->
      <MenuItems static>
        <MenuItem v-slot="{ active }">
          <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Account settings </a>
        </MenuItem>
        <!-- ... -->
      </MenuItems>
    </div>
  </Menu>
</template>
```

### Disabling an item

Use the `disabled` prop to disable a `MenuItem`. This will make it unselectable via keyboard navigation, and it will be skipped when pressing the up/down arrows.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>
    <MenuItems>
      <MenuItem disabled>
        <span class="opacity-75">Invite a friend (coming soon!)</span>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

### Transitions

To animate the opening/closing of the menu panel, use Vue's built-in `transition` component. All you need to do is wrap your `MenuItems` instance in a `<transition>` element and the transition will be applied automatically.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems>
        <MenuItem v-slot="{ active }">
          <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Account settings </a>
        </MenuItem>
        <!-- ... -->
      </MenuItems>
    </transition>
  </Menu>
</template>
```

### Rendering additional content

The `Menu` component is not limited to rendering only its related subcomponents. You can render anything you like within a menu, which gives you complete control over exactly what you are building.

For example, if you'd like to add a little header section to the menu with some extra information in it, just render an extra `div` with your content in it.

```vue
<template>
  <Menu>
    <MenuButton> More </MenuButton>
    <MenuItems>
      <div class="px-4 py-3">
        <p class="text-sm leading-5">Signed in as</p>
        <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
      </div>
      <MenuItem v-slot="{ active }">
        <a :class="{ 'bg-blue-500': active }" href="/account-settings"> Account settings </a>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

Note that only `MenuItem` instances will be navigable via the keyboard.

### Rendering a different element for a component

By default, the `Menu` and its subcomponents each render a default element that is sensible for that component.

For example, `MenuButton` renders a `button` by default, and `MenuItems` renders a `div`. `Menu` and `MenuItem` interestingly _do not render an extra element_, and instead render their children directly by default.

This is easy to change using the `as` prop, which exists on every component.

```vue
<template>
  <!-- Render a `div` instead of no wrapper element -->
  <Menu as="div">
    <MenuButton> More </MenuButton>
    <!-- Render a `ul` instead of a `div` -->
    <MenuItems as="ul">
      <!-- Render an `li` instead of no wrapper element -->
      <MenuItem as="li" v-slot="{ active }">
        <a href="/account-settings" :class="{ 'bg-blue-500': active }"> Account settings </a>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

To tell an element to render its children directly with no wrapper element, use `as="template"`.

```vue
<template>
  <Menu>
    <!-- Render no wrapper, instead pass in a button manually -->
    <MenuButton as="template">
      <button>More</button>
    </MenuButton>
    <MenuItems>
      <MenuItem v-slot="{ active }">
        <a href="/account-settings" :class="{ 'bg-blue-500': active }"> Account settings </a>
      </MenuItem>
      <!-- ... -->
    </MenuItems>
  </Menu>
</template>
```

### Component API

#### Menu

```vue
<Menu v-slot="{ open }">
  <MenuButton>More options</MenuButton>
  <MenuItems>
    <MenuItem><!-- ... --></MenuItem>
    <!-- ... -->
  </MenuItems>
</Menu>
```

##### Props

| Prop | Type                | Default                           | Description                                           |
| ---- | ------------------- | --------------------------------- | ----------------------------------------------------- |
| `as` | String \| Component | `template` _(no wrapper element_) | The element or component the `Menu` should render as. |

##### Slot props

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### MenuButton

```vue
<MenuButton v-slot="{ open }">
  <span>More options</span>
  <ChevronRightIcon :class="open ? 'transform rotate-90' : ''" />
</MenuButton>
```

##### Props

| Prop | Type                | Default  | Description                                                 |
| ---- | ------------------- | -------- | ----------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `MenuButton` should render as. |

##### Slot props

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### MenuItems

```vue
<MenuItems>
  <MenuItem><!-- ... --></MenuItem>
  <!-- ... -->
</MenuItem>
```

##### Props

| Prop     | Type                | Default | Description                                                                 |
| -------- | ------------------- | ------- | --------------------------------------------------------------------------- |
| `as`     | String \| Component | `div`   | The element or component the `MenuItems` should render as.                  |
| `static` | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state. |

##### Slot props

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### MenuItem

```vue
<MenuItem v-slot="{ active }">
  <a href="/settings" :class="active ? 'bg-blue-500 text-white' : 'bg-white text-black'">
    Settings
  </a>
</MenuItem>
```

##### Props

| Prop       | Type                | Default                           | Description                                                                           |
| ---------- | ------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `as`       | String \| Component | `template` _(no wrapper element)_ | The element or component the `MenuItem` should render as.                             |
| `disabled` | Boolean             | `false`                           | Whether or not the item should be disabled for keyboard navigation and ARIA purposes. |

##### Slot props

| Prop       | Type    | Description                                                                        |
| ---------- | ------- | ---------------------------------------------------------------------------------- |
| `active`   | Boolean | Whether or not the item is the active/focused item in the list.                    |
| `disabled` | Boolean | Whether or not the item is the disabled for keyboard navigation and ARIA purposes. |

## Listbox

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuivue-menu-example-70br3?file=/src/App.vue)

The `Listbox` component and related child components are used to quickly build custom listbox components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Basic example](#basic-example-2)
- [Styling the active and selected option](#styling-the-active-and-selected-option)
- [Showing/hiding the listbox](#showinghiding-the-listbox)
- [Using a custom label](#using-a-custom-label)
- [Disabling an option](#disabling-an-option)
- [Transitions](#transitions-1)
- [Rendering additional content](#rendering-additional-content-1)
- [Rendering a different element for a component](#rendering-a-different-element-for-a-component-1)
- [Component API](#component-api-2)

### Basic example

Listboxes are built using the `Listbox`, `ListboxButton`, `ListboxOptions`, `ListboxOption` and `ListboxLabel` components.

The `ListboxButton` will automatically open/close the `ListboxOptions` when clicked, and when the menu is open, the list of items receives focus and is automatically navigable via the keyboard.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>
    <ListboxOptions>
      <ListboxOption value="option-a">Option A</ListboxOption>
      <ListboxOption value="option-b">Option B </ListboxOption>
      <ListboxOption value="option-c" disabled>
        Option C
      </ListboxOption>
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Styling the active and selected option

This is a headless component so there are no styles included by default. Instead, the components expose useful information via [render props](https://reactjs.org/docs/render-props.html) that you can use to apply the styles you'd like to apply yourself.

To style the active `ListboxOption` you can read the `active` render prop argument, which tells you whether or not that listbox option is the option that is currently focused via the mouse or keyboard.

To style the selected `ListboxOption` you can read the `selected` render prop argument, which tells you whether or not that listbox option is the option that is currently the `value` passed to the `Listbox`.

> Note: An option can be both **active** and **selected** at the same time!

You can use this state to conditionally apply whatever active/focus styles you like, for instance a blue background like is typical in most operating systems. For the selected state, a checkmark is also common.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>
    <ListboxOptions>
      <!-- Use the `active` state to conditionally style the active option. -->
      <!-- Use the `selected` state to conditionally style the selected option. -->
      <ListboxOption as="template" value="option-a" v-slot="{ active, selected }">
        <li :class="{ 'bg-blue-500 text-white': active, 'bg-white text-black': !active }">
          <!-- Checkmark svg -->
          <svg v-show="selected" />
          Option A
        </li>
      </ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Using a custom label

By default the `Listbox` will use the button contents as the label for screenreaders. However you can also render a custom `ListboxLabel`.

```vue
<template>
  <Listbox v-model="country">
    <ListboxLabel>Country:</ListboxLabel>
    <ListboxButton>{country}</ListboxButton>
    <ListboxOptions>
      <ListboxOption value="australia">Australia</ListboxOption>
      <ListboxOption value="belgium">Belgium</ListboxOption>
      <ListboxOption value="canada">Canada</ListboxOption>
      <ListboxOption value="england">England</ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      country: ref('belgium'),
    }
  },
}
</script>
```

### Showing/hiding the listbox

By default, your `ListboxOptions` instance will be shown/hidden automatically based on the internal `open` state tracked within the `Listbox` component itself.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>

    <!-- By default, this will automatically show/hide when the ListboxButton is pressed. -->
    <ListboxOptions>
      <ListboxOption value="option-a"><!-- ... --></ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

If you'd rather handle this yourself (perhaps because you need to add an extra wrapper element for one reason or another), you can add a `static` prop to the `ListboxOptions` instance to tell it to always render, and inspect the `open` slot prop provided by the `Listbox` to control which element is shown/hidden yourself.

```vue
<template>
  <Listbox v-model="option" v-slot="{ open }">
    <ListboxButton>More</ListboxButton>
    <div v-show="open">
      <!-- Using `static`, `ListboxOptions` is always rendered and ignores the `open` state. -->
      <ListboxOptions static>
        <ListboxOption value="option-a"><!-- ... --></ListboxOption>
        <!-- ... -->
      </ListboxOptions>
    </div>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Disabling an option

Use the `disabled` prop to disable a `ListboxOption`. This will make it unselectable via keyboard navigation, and it will be skipped when pressing the up/down arrows.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>
    <ListboxOptions>
      <!-- ... -->

      <!-- This option will be skipped by keyboard navigation. -->
      <ListboxOption disabled value="option-a">
        <span class="opacity-75">Invite a friend (coming soon!)</span>
      </ListboxOption>

      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Transitions

To animate the opening/closing of the listbox panel, use the provided `Transition` component. All you need to do is mark your `ListboxOptions` as `static`, wrap it in a `<Transition>`, and the transition will be applied automatically.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>

    <!-- Use the Transition + open render prop argument to add transitions. -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <ListboxOptions>
        <ListboxOption value="option-a"><!-- ... --></ListboxOption>
        <!-- ... -->
      </ListboxOptions>
    </transition>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Rendering additional content

The `Listbox` component is not limited to rendering only its related subcomponents. You can render anything you like within a listbox, which gives you complete control over exactly what you are building.

For example, if you'd like to add a little header section to the listbox with some extra information in it, just render an extra `div` with your content in it.

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>
    <ListboxOptions>
      <div class="px-4 py-3">
        <p class="text-sm leading-5">Signed in as</p>
        <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
      </div>
      <ListboxOption value="option-a">Option A</ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

Note that only `ListboxOption` instances will be navigable via the keyboard.

### Rendering a different element for a component

By default, the `Listbox` and its subcomponents each render a default element that is sensible for that component.

For example, `ListboxLabel` renders a `label` by default, `ListboxButton` renders a `button` by default, `ListboxOptions` renders a `ul` and `ListboxOption` renders a `li` by default. `Listbox` interestingly _does not render an extra element_, and instead renders its children directly by default.

This is easy to change using the `as` prop, which exists on every component.

```vue
<template>
  <!-- Render a `div` instead of no wrapper element -->
  <Listbox as="div" v-model="option">
    <ListboxButton>More</ListboxButton>
    <!-- Render a `div` instead of a `ul` -->
    <ListboxOptions as="div">
      <!-- Render an `span` instead of an `li` -->
      <ListboxOption as="span" value="option-a">
        Option A
      </ListboxOption>

      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

To tell an element to render its children directly with no wrapper element, use `as={React.Fragment}`.

```vue
<template>
  <Listbox v-model="option">
    <!-- Render no wrapper, instead pass in a button manually. -->
    <ListboxButton as="template">
      <button>More</button>
    </ListboxButton>
    <ListboxOptions>
      <ListboxOption value="option-a">Option A</ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

### Component API

#### Listbox

```vue
<template>
  <Listbox v-model="option">
    <ListboxButton>More</ListboxButton>
    <ListboxOptions>
      <ListboxOption value="option-a"><!-- ... --></ListboxOption>
      <!-- ... -->
    </ListboxOptions>
  </Listbox>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

export default {
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
  setup() {
    return {
      option: ref('option-a'),
    }
  },
}
</script>
```

##### Props

| Prop      | Type                    | Default                           | Description                                              |
| --------- | ----------------------- | --------------------------------- | -------------------------------------------------------- |
| `as`      | String \| Component     | `template` _(no wrapper element_) | The element or component the `Listbox` should render as. |
| `v-model` | `T` _(A generic value)_ | `undefined`                       | The selected value.                                      |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### ListboxButton

```vue
<ListboxButton>
  {({ open }) => (
    <>
      <span>More options</span>
      <ChevronRightIcon class={`${open ? 'transform rotate-90' : ''}`} />
    </>
  )}
</ListboxButton>
```

##### Props

| Prop | Type                | Default  | Description                                                    |
| ---- | ------------------- | -------- | -------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `ListboxButton` should render as. |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### ListboxLabel

```vue
<ListboxLabel>Enable notifications</ListboxLabel>
```

##### Props

| Prop | Type                | Default | Description                                                   |
| ---- | ------------------- | ------- | ------------------------------------------------------------- |
| `as` | String \| Component | `label` | The element or component the `ListboxLabel` should render as. |

#### ListboxOptions

```vue
<ListboxOptions>
  <ListboxOption value="option-a"><!-- ... -->></ListboxOption>
  <!-- ... -->>
</ListboxOptions>
```

##### Props

| Prop     | Type                | Default | Description                                                                 |
| -------- | ------------------- | ------- | --------------------------------------------------------------------------- |
| `as`     | String \| Component | `ul`    | The element or component the `ListboxOptions` should render as.             |
| `static` | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state. |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### ListboxOption

```vue
<ListboxOption value="option-a">Option A</ListboxOption>
```

##### Props

| Prop       | Type                    | Default     | Description                                                                             |
| ---------- | ----------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `as`       | String \| Component     | `li`        | The element or component the `ListboxOption` should render as.                          |
| `value`    | `T` _(A generic value)_ | `undefined` | The selected value.                                                                     |
| `disabled` | Boolean                 | `false`     | Whether or not the option should be disabled for keyboard navigation and ARIA purposes. |

##### Render prop object

| Prop       | Type    | Description                                                                          |
| ---------- | ------- | ------------------------------------------------------------------------------------ |
| `active`   | Boolean | Whether or not the option is the active/focused option in the list.                  |
| `selected` | Boolean | Whether or not the option is the selected option in the list.                        |
| `disabled` | Boolean | Whether or not the option is the disabled for keyboard navigation and ARIA purposes. |
