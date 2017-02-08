
const serialize = require('serialize-dom')
const tsml = require('tsml')
const test = require('tape')
const h = require('./')

test('create nodes', (t) => {
  t.equal(serialize(h('h1')), '<h1></h1>', 'empty element')
  t.equal(
    serialize(h('h1', 'hello world')),
    '<h1>hello world</h1>',
    'text node'
  )

  t.end()
})

test('create nested nodes', (t) => {
  const tree = h('div', [
    h('h1', 'Title'),
    h('p', 'Paragraph')
  ])

  t.equal(serialize(tree), '<div><h1>Title</h1><p>Paragraph</p></div>')
  t.end()
})

test('create node with attributes', (t) => {
  const node = h('div', { class: 'test', 'data-id': 2 })
  t.equal(node.getAttribute('class'), 'test', 'reserved keywords')
  t.equal(node.getAttribute('data-id'), '2', 'data attributes')
  t.equal(serialize(node), '<div class="test" data-id="2"></div>')
  t.end()
})

test('create nested nodes with all different kinds of combinations', (t) => {
  const tree = h('div', { class: 'full-width p2' }, [
    h('h1', 'Some text'),
    h('div', { style: 'background-color: red;' }, [
      h('a', { href: 'http://github.com' }, 'Github')
    ])
  ])

  t.equal(serialize(tree), tsml`
    <div class="full-width p2">
      <h1>Some text</h1>
      <div style="background-color: red;">
        <a href="http://github.com">Github</a>
      </div>
    </div>
  `)

  t.end()
})

test('hyperscript helpers', (t) => {
  const tree = h.div({ id: 'js-root' }, [
    h.h1('Hello World!'),
    h.p({ class: 'test' }, 'This is a description'),
    h.button('Click!')
  ])

  t.equal(serialize(tree), tsml`
    <div id="js-root">
      <h1>Hello World!</h1>
      <p class="test">This is a description</p>
      <button>Click!</button>
    </div>
  `)

  t.end()
})

test('supports boolean attributes', (t) => {
  const tree = h('input', {
    type: 'checkbox',
    autofocus: true,
    checked: false
  })

  t.equal(serialize(tree), tsml`
    <input type="checkbox" autofocus="autofocus">
  `)

  t.end()
})

test('ignore null as children', (t) => {
  const node1 = h('div', [h('p', 'hello'), null])
  const node2 = h('div', [null])
  const node3 = h('div', [undefined])
  const node4 = h('div', [undefined, null, h('p', 'hello')])

  t.equal(serialize(node1), '<div><p>hello</p></div>')
  t.equal(serialize(node2), '<div></div>')
  t.equal(serialize(node3), '<div></div>')
  t.equal(serialize(node4), '<div><p>hello</p></div>')
  t.end()
})

test('adds event handlers', (t) => {
  const handler = () => 'clicked'
  const node1 = h('button', { onclick: handler })
  t.equal(node1.onclick, handler)
  t.equal(node1.onclick(), 'clicked')

  // custom attribute casing
  const node2 = h('button', { onSubmit: handler })
  t.equal(node2.onsubmit, handler)
  t.equal(node2.onsubmit(), 'clicked')
  t.end()
})

test('supports svg attributes', (t) => {
  const node = h('use', { 'xlink:href': '#test' })
  t.equal(node.attributes[0].ns, 'http://www.w3.org/1999/xlink')
  t.end()
})

test('does not add unknown namespace attributes', (t) => {
  const node = h('use', { 'randomnamespace:href': '#test' })
  t.equal(node.attributes[0].ns, null)
  t.end()
})