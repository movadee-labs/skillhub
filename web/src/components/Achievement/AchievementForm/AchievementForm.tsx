import { css, cx } from '@emotion/css';
import React, { PropsWithChildren, ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createEditor, Descendant, Editor, Element as SlateElement, Node, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, useFocused, useSlate, useSlateStatic, withReact } from 'slate-react';

export type EditableVoidElement = {
  type: 'editable-void'
  children: EmptyText[]
}

const initialValue: Descendant[] = [
  {
    type: 'title',
    children: [{ text: 'Software Engineer III' }],
  },
  // {
  //   type: 'paragraph',
  //   children: [
  //     {
  //       text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
  //     },
  //   ],
  // },
  {
    type: 'bulleted-list',
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'bulleted-list',
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'bulleted-list',
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'bulleted-list',
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'bulleted-list',
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'bulleted-list',
    children: [{ text: "Let's go to work!" }],
  },
]

const CheckListsExample = () => {
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const editor = useMemo(
    () => withLayout(withHistory(withReact(createEditor()))),
    []
  )

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <HoveringToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={(props) => <Leaf {...props} />}
        placeholder="Enter some text..."
        onChange={(value) => console.log(value)}
        spellCheck
        onDOMBeforeInput={(event: InputEvent) => {
          switch (event.inputType) {
            case 'formatBold':
              event.preventDefault()
              return toggleMark(editor, 'bold')
            case 'formatItalic':
              event.preventDefault()
              return toggleMark(editor, 'italic')
            case 'formatUnderline':
              event.preventDefault()
              return toggleMark(editor, 'underlined')
          }
        }}
      />
    </Slate>
  )
}

const Leaf = ({ attributes, children, leaf }) => {
  const [aiResponse, setAiResponse] = useState(null)
  const [isUnderlined, setIsUnderlined] = useState(false)

  const extractTextFromChildren = (children) => {
    let text = ''
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        text += child
      } else if (child.props && child.props.children) {
        text += extractTextFromChildren(child.props.children)
      }
    })
    return text
  }

  const askAI = async (children) => {
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Generate a Powerful Resume Line: i am a Software Developer, who did the following: ${children}. do not wrap text in quotes`,
        },
      ],
    }

    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REDWOOD_ENV_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => result.choices[0].message.content)
  }

  useEffect(() => {
    if (leaf.underlined && !isUnderlined) {
      setIsUnderlined(true)
      const textContent = extractTextFromChildren(children)
      askAI(textContent).then(setAiResponse)
    } else if (!leaf.underlined && isUnderlined) {
      setIsUnderlined(false)
    }
  }, [children, leaf.underlined])

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    // children = <u>{children}</u>
    children = aiResponse || children // Use AI response if available
  }

  return <span {...attributes}>{children}</span>
}

const Element = (props) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'title':
      return <h3 {...attributes}>{children}</h3>
    case 'bulleted-list':
      return <ListItemElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const ListItemElement = ({ attributes, children }) => (
  <div {...attributes}>
    <li>{children}</li>
  </div>
)

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>()
  const editor = useSlate()
  const inFocus = useFocused()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = '1'
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`
  })

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
        onMouseDown={(e) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault()
        }}
      >
        {/* <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" /> */}
        <FormatButton format="underlined" icon="format_underlined" />
      </Menu>
    </Portal>
  )
}

export const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}
export const Menu = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>
  ) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={cx(
        className,
        css`
          & > * {
            display: inline-block;
          }

          & > * + * {
            margin-left: 15px;
          }
        `
      )}
    />
  )
)

const withLayout = (editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === '') {
        const title: TitleElement = {
          type: 'title',
          children: [{ text: 'Untitled' }],
        }
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        })
      }

      if (editor.children.length < 2) {
        const listItem: BulletedListElement = {
          type: 'bulleted-list',
          children: [{ text: '' }],
        }
        Transforms.insertNodes(editor, listItem, { at: path.concat(1) })
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        let type: string
        const slateIndex = childPath[0]
        const enforceType = (type) => {
          if (SlateElement.isElement(child) && child.type !== type) {
            const newProperties: Partial<SlateElement> = { type }
            Transforms.setNodes<SlateElement>(editor, newProperties, {
              at: childPath,
            })
          }
        }

        switch (slateIndex) {
          case 0:
            type = 'title'
            enforceType(type)
            break
          case 1:
            type = 'bulleted-list'
            enforceType(type)
            break
          default:
            break
        }
      }
    }

    return normalizeNode([node, path])
  }

  return editor
}

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

export type TitleElement = { type: 'title'; children: Descendant[] }

export type BulletedListElement = {
  type: 'bulleted-list'
  align?: string
  children: Descendant[]
}

const FormatButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      reversed
      active={isMarkActive(editor, format)}
      onClick={() => toggleMark(editor, format)}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean
        reversed: boolean
      } & BaseProps
    >,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'white'
              : '#aaa'
            : active
            ? 'black'
            : '#ccc'};
        `
      )}
    />
  )
)

export const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        'material-icons',
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `
      )}
    />
  )
)

interface BaseProps {
  className: string
  [key: string]: unknown
}
type OrNull<T> = T | null

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// export default CheckListsExample

// editable voids
const EditableVoidsExample = () => {
  const editor = useMemo(
    () => withEditableVoids(withHistory(withReact(createEditor()))),
    []
  )

  return (
    <Slate editor={editor} initialValue={initialValue2}>
      <InsertEditableVoidButton />

      <Editable
        renderElement={(props) => <Element2 {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  )
}

const withEditableVoids = (editor) => {
  const { isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'editable-void' ? true : isVoid(element)
  }

  return editor
}

const insertEditableVoid = (editor) => {
  const text = { text: '' }
  const voidNode: EditableVoidElement = {
    type: 'editable-void',
    children: [text],
  }
  Transforms.insertNodes(editor, voidNode, { at: [0] })
}

const Element2 = (props) => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'editable-void':
      return <EditableVoid {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const EditableVoid = ({ attributes, children, element }) => {
  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <CheckListsExample />
      {children}
    </div>
  )
}

const InsertEditableVoidButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault()
        insertEditableVoid(editor)
      }}
    >
      <Icon>add</Icon>
    </Button>
  )
}

const initialValue2: Descendant[] = [
  {
    type: 'editable-void',
    children: [{ text: '' }],
  },
]

export default EditableVoidsExample

// import { css } from '@emotion/css';
// import { useForm } from '@redwoodjs/forms';
// import React, { useCallback, useMemo, useState } from 'react';
// import { createEditor, Descendant, Editor, Element as SlateElement, Point, Range, Transforms } from 'slate';
// import { withHistory } from 'slate-history';
// import { Editable, ReactEditor, Slate, useReadOnly, useSlateStatic, withReact } from 'slate-react';
// import { css } from '@emotion/css';
// import React, { useCallback, useMemo, useState } from 'react';
// import { createEditor } from 'slate';
// import { withHistory } from 'slate-history';
// import { Editable, Slate, withReact } from 'slate-react';
// import React, { useMemo, useState } from 'react';
// import { createEditor, Descendant } from 'slate';
// import { withHistory } from 'slate-history';
// import { Editable, Slate, withReact } from 'slate-react';

// import type { EditAchievementById, UpdateAchievementInput } from 'types/graphql'

// import type { RWGqlError } from '@redwoodjs/forms'

// type FormAchievement = NonNullable<EditAchievementById['achievement']>

// interface AchievementFormProps {
//   achievement?: EditAchievementById['achievement']
//   onSave: (data: UpdateAchievementInput, id?: FormAchievement['id']) => void
//   error: RWGqlError
//   loading: boolean
// }

// const AchievementForm = (props: AchievementFormProps) => {
//   const editor = useMemo(
//     () => withChecklists(withHistory(withReact(createEditor()))),
//     []
//   )

//   // Modify the renderElement to include drag handlers
//   const renderElement = useCallback(
//     (props) => {
//       const elementProps = {
//         ...props,
//         onDragStart,
//         onDragOver,
//         onDrop,
//       }
//       return <Element {...elementProps} />
//     },
//     [onDragStart, onDragOver, onDrop]
//   )

//   const formMethods = useForm()

//   const { setValue, getValues } = formMethods

//   const onSubmit = (data: FormAchievement) => {
//     props.onSave(data, props?.achievement?.id)
//   }

//   // return (
//   //   <div className="rw-form-wrapper">
//   //     <Form onSubmit={onSubmit} error={props.error} formMethods={formMethods}>
//   //       <FormError
//   //         error={props.error}
//   //         wrapperClassName="rw-form-error-wrapper"
//   //         titleClassName="rw-form-error-title"
//   //         listClassName="rw-form-error-list"
//   //       />

//   //       {/* <Label
//   //         name="body"
//   //         className="rw-label"
//   //         errorClassName="rw-label rw-label-error"
//   //       >
//   //         Body
//   //       </Label> */}

//   //       <TextField
//   //         name="body"
//   //         defaultValue={props.achievement?.body}
//   //         className="rw-input"
//   //         errorClassName="rw-input rw-input-error"
//   //         validation={{ required: true }}
//   //       />

//   //       <FieldError name="body" className="rw-field-error" />

//   //       {/* <div className="rw-button-group"> */}
//   //       <Submit disabled={props.loading} className="rw-button rw-button-blue">
//   //         Save
//   //       </Submit>
//   //       <button type="button" onClick={askAI}>
//   //         Ask AI
//   //       </button>
//   //       {/* </div> */}
//   //     </Form>
//   //   </div>
//   // )
// }
