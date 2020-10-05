import * as React from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'

type StateDefinition = {
  switch: HTMLButtonElement | null
  label: HTMLLabelElement | null

  setSwitch(element: HTMLButtonElement): void
  setLabel(element: HTMLLabelElement): void
}

const GroupContext = React.createContext<StateDefinition | null>(null)

function useGroupContext(component: string) {
  const context = React.useContext(GroupContext)
  if (context === null) {
    const err = new Error(`<${component} /> is missing a parent <Switch.Group /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useGroupContext)
    throw err
  }
  return context
}

// ---

const DEFAULT_GROUP_TAG = React.Fragment

function Group<TTag extends React.ElementType = typeof DEFAULT_GROUP_TAG>(props: Props<TTag>) {
  const [switchElement, setSwitchElement] = React.useState<HTMLButtonElement | null>(null)
  const [labelElement, setLabelElement] = React.useState<HTMLLabelElement | null>(null)

  const context = React.useMemo<StateDefinition>(
    () => ({
      switch: switchElement,
      label: labelElement,
      setSwitch: setSwitchElement,
      setLabel: setLabelElement,
    }),
    [switchElement, setSwitchElement, labelElement, setLabelElement]
  )
  return (
    <GroupContext.Provider value={context}>
      {render(props, {}, DEFAULT_GROUP_TAG)}
    </GroupContext.Provider>
  )
}

// ---

const DEFAULT_SWITCH_TAG = 'button'

type SwitchRenderPropArg = { checked: boolean }

type SwitchPropsWeControl = 'id' | 'role' | 'tabIndex' | 'aria-checked' | 'onClick' | 'onKeyUp'

export function Switch<TTag extends React.ElementType = typeof DEFAULT_SWITCH_TAG>(
  props: Props<
    TTag,
    SwitchRenderPropArg,
    SwitchPropsWeControl | 'checked' | 'onChange' | 'className'
  > & {
    checked: boolean
    onChange(checked: boolean): void

    // Special treatment, can either be a string or a function that resolves to a string
    className?: ((bag: SwitchRenderPropArg) => string) | string
  }
) {
  const { checked, onChange, className, ...passThroughProps } = props
  const id = `headlessui-switch-${useId()}`
  const groupContext = React.useContext(GroupContext)

  const toggle = React.useCallback(() => onChange(!checked), [onChange, checked])
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      toggle()
    },
    [toggle]
  )
  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === Keys.Space) {
        event.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

  const propsBag = React.useMemo<SwitchRenderPropArg>(() => ({ checked }), [checked])
  const propsWeControl = {
    id,
    ref: groupContext === null ? undefined : groupContext.setSwitch,
    role: 'switch',
    tabIndex: 0,
    className: resolvePropValue(className, propsBag),
    'aria-checked': checked,
    'aria-labelledby': groupContext?.label?.id,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
  }

  return render({ ...passThroughProps, ...propsWeControl }, propsBag, DEFAULT_SWITCH_TAG)
}

// ---

type LabelPropsWeControl = 'id' | 'ref' | 'onPointerUp'

const DEFAULT_LABEL_TAG = 'label'

type LabelRenderPropArg = {}

function Label<TTag extends React.ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>
) {
  const state = useGroupContext([Switch.name, Label.name].join('.'))
  const id = `headlessui-switch-label-${useId()}`

  const handlePointerUp = React.useCallback(() => {
    if (!state.switch) return
    state.switch.click()
    state.switch.focus()
  }, [state.switch])

  const propsWeControl = {
    ref: state.setLabel,
    id,
    onPointerUp: handlePointerUp,
  }
  return render({ ...props, ...propsWeControl }, {}, DEFAULT_LABEL_TAG)
}

// ---

Switch.Group = Group
Switch.Label = Label

// ---

function resolvePropValue<TProperty, TBag>(property: TProperty, bag: TBag) {
  if (property === undefined) return undefined
  if (typeof property === 'function') return property(bag)
  return property
}
