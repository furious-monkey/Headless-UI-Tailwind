import { defineComponent } from 'vue'
import { createRenderTemplate } from '../test-utils/vue-testing-library'

import { render } from './render'
import { html } from '../test-utils/html'

let Dummy = defineComponent({
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots }) {
    return () => render({ props, slots, attrs, slot: {}, name: 'Dummy' })
  },
})

const renderTemplate = createRenderTemplate({ Dummy })

describe('Validation', () => {
  it('should error when using an as="template" with additional props', () => {
    expect.hasAssertions()

    renderTemplate({
      template: html` <Dummy as="template" class="abc">Contents</Dummy> `,
      errorCaptured(err) {
        expect(err as Error).toEqual(
          new Error(
            [
              'Passing props on "template"!',
              '',
              'The current component <Dummy /> is rendering a "template".',
              'However we need to passthrough the following props:',
              '  - class',
              '',
              'You can apply a few solutions:',
              '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
              '  - Render a single element as the child so that we can forward the props onto that element.',
            ].join('\n')
          )
        )
        return false
      },
    })
  })

  it('should forward the props to the first child', () => {
    renderTemplate({
      template: html`
        <Dummy as="template" class="abc">
          <div id="result">Contents</div>
        </Dummy>
      `,
    })

    expect(document.getElementById('result')).toHaveClass('abc')
  })

  it('should forward the props via Functional Components', () => {
    renderTemplate({
      components: {
        PassThrough(props, context) {
          props.as = props.as ?? 'template'
          return render({
            props,
            attrs: context.attrs,
            slots: context.slots,
            slot: {},
            name: 'PassThrough',
          })
        },
      },
      template: html`
        <Dummy as="template" class="abc" data-test="123">
          <PassThrough>
            <div id="result">Contents</div>
          </PassThrough>
        </Dummy>
      `,
    })

    expect(document.getElementById('result')).toHaveClass('abc')
  })

  it('should allow use of <slot> as children', () => {
    renderTemplate({
      template: html`
        <ExampleOuter>
          <div id="result">Some Content</div>
        </ExampleOuter>
      `,

      components: {
        ExampleOuter: defineComponent({
          template: html`
            <ExampleInner>
              <slot />
            </ExampleInner>
          `,

          components: {
            ExampleInner: defineComponent({
              components: { Dummy },

              template: html`
                <Dummy as="template" class="foo" data-test="123">
                  <Dummy as="template" class="bar" data-test="345">
                    <slot />
                  </Dummy>
                </Dummy>
              `,
            }),
          },
        }),
      },
    })

    expect(document.getElementById('result')).toHaveClass('foo')
    expect(document.getElementById('result')).toHaveClass('bar')

    // TODO: Is this the expected behavior? Should it actually be `345`?
    expect(document.getElementById('result')).toHaveAttribute('data-test', '123')
  })
})
