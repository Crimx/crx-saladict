import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { SaladBowl } from './SaladBowl'
import { SaladBowlPortal } from './SaladBowl.portal'
import { withLocalStyle } from '@/_helpers/storybook'

storiesOf('Content Scripts|SaladBowl', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .add(
    'SaladBowl',
    () => (
      <SaladBowl
        x={number('mouseX', 30)}
        y={number('mouseY', 30)}
        withAnimation={boolean('Animation', true)}
        enableHover={boolean('Enable hover', true)}
        onActive={action('onActive')}
        onHover={action('onActive')}
      />
    ),
    {
      decorators: [withLocalStyle(require('./SaladBowl.shadow.scss'))],
      jsx: { skip: 1 }
    }
  )
  .add('SaladBowlPortal', () => (
    <SaladBowlPortal
      show={boolean('Show', true)}
      x={number('mouseX', 30)}
      y={number('mouseY', 30)}
      withAnimation={boolean('Animation', true)}
      enableHover={boolean('Enable hover', true)}
      onActive={action('onActive')}
    />
  ))
  .add('Bowl Playground', () =>
    React.createElement(() => {
      const [{ x, y }, setCoord] = useState({ x: 0, y: 0 })

      const iconWidth = 30
      const iconGap = 15
      const scrollbarWidth = 10

      return (
        <div
          style={{ height: '100vh', background: '#5caf9e', overflow: 'hidden' }}
          onClick={e =>
            setCoord({
              x:
                e.clientX + iconGap + iconWidth >
                window.innerWidth - scrollbarWidth // right overflow
                  ? e.clientX - iconGap - iconWidth // switch to left
                  : e.clientX + iconGap,
              y:
                e.clientY < iconWidth + iconGap // top overflow
                  ? e.clientY + iconGap // switch to bottom
                  : e.clientY - iconWidth - iconGap
            })
          }
        >
          <p style={{ textAlign: 'center', color: '#fff', userSelect: 'none' }}>
            CLICK AROUND AND SEE THE BOWL FOLLOWS
          </p>
          <SaladBowlPortal
            show
            x={x}
            y={y}
            withAnimation={boolean('Animation', true)}
            enableHover={boolean('Enable hover', true)}
            onActive={action('onActive')}
          />
        </div>
      )
    })
  )
