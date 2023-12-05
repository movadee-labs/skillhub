import { css, cx } from '@emotion/css';
import React, { PropsWithChildren, ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createEditor, Descendant, Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, useFocused, useSlate, withReact } from 'slate-react';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: 'list-item',
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'list-item',
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'list-item',
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

const CheckListsExample = () => {
  const [value, setValue] = useState(initialValue)
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const handleChange = (content) => {
    setValue(content)

    console.log(value)
  }

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <HoveringToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={(props) => <Leaf {...props} />}
        placeholder="Enter some text..."
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
    return fetch('https://api.openai.com/v1/engines/davinci/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REDWOOD_ENV_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: children,
        max_tokens: 150,
      }),
    })
      .then((response) => response.json())
      .then((json) => json.choices[0]?.text)
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
    case 'list-item':
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

export default CheckListsExample

// import 'react-quill/dist/quill.snow.css';

// import { useState } from 'react';
// import ReactQuill from 'react-quill';

// const AchievementForm = () => {
//   const [value, setValue] = useState([])

//   const handleChange = (content) => {
//     setValue(content)

//     // Creating a simple JSON object with the HTML content
//     const contentJson = {
//       htmlContent: content,
//     }

//     console.log('Content in JSON format:', contentJson)
//   }

//   return (
//     <ReactQuill
//       theme="snow"
//       value={value}
//       onChange={setValue}
//       onChange={handleChange}
//     />
//   )
// }

// export default AchievementForm

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

// const initialValue: Descendant[] = [
//   {
//     type: 'paragraph',
//     children: [
//       {
//         text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
//       },
//     ],
//   },
//   {
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the left.' }],
//   },
//   {
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the right.' }],
//   },
//   {
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Criss-cross.' }],
//   },
//   {
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Criss-cross!' }],
//   },
//   {
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Cha cha real smooth…' }],
//   },
//   {
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: "Let's go to work!" }],
//   },
//   {
//     type: 'paragraph',
//     children: [{ text: 'Try it out for yourself!' }],
//   },
// ]

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

//   // Drag and drop logic
//   const [draggedElement, setDraggedElement] = useState(null)

//   const onDragStart = useCallback((event, element) => {
//     setDraggedElement(element)
//     event.dataTransfer.effectAllowed = 'move'
//   }, [])

//   const onDragOver = useCallback((event) => {
//     event.preventDefault()
//     event.dataTransfer.dropEffect = 'move'
//   }, [])

//   const onDrop = useCallback(
//     (event, targetElement) => {
//       event.preventDefault()

//       if (draggedElement && targetElement && draggedElement !== targetElement) {
//         const draggedPath = ReactEditor.findPath(editor, draggedElement)
//         const targetPath = ReactEditor.findPath(editor, targetElement)

//         // Determine the index to move the dragged element to
//         // This logic assumes you want to place the dragged element before the target element
//         const targetIndex = targetPath[targetPath.length - 1]

//         Transforms.moveNodes(editor, {
//           at: draggedPath,
//           to: targetPath.slice(0, -1).concat(targetIndex),
//         })
//       }

//       setDraggedElement(null)
//     },
//     [draggedElement]
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

//   const askAI = () => {
//     fetch('https://api.openai.com/v1/engines/davinci/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.REDWOOD_ENV_OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         prompt: getValues('body'),
//         max_tokens: 150,
//       }),
//     })
//       .then((response) => response.json())
//       .then((json) => console.log(json.choices[0]?.text))
//       .then((json) => setValue('body', 'new value'))
//   }
//   return (
//     <Slate editor={editor} initialValue={initialValue}>
//       <Editable
//         renderElement={renderElement}
//         placeholder="Get to work…"
//         spellCheck
//         autoFocus
//       />
//     </Slate>
//   )

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

// const withChecklists = (editor) => {
//   const { deleteBackward } = editor

//   editor.deleteBackward = (...args) => {
//     const { selection } = editor

//     if (selection && Range.isCollapsed(selection)) {
//       const [match] = Editor.nodes(editor, {
//         match: (n) =>
//           !Editor.isEditor(n) &&
//           SlateElement.isElement(n) &&
//           n.type === 'check-list-item',
//       })

//       if (match) {
//         const [, path] = match
//         const start = Editor.start(editor, path)

//         if (Point.equals(selection.anchor, start)) {
//           const newProperties: Partial<SlateElement> = {
//             type: 'paragraph',
//           }
//           Transforms.setNodes(editor, newProperties, {
//             match: (n) =>
//               !Editor.isEditor(n) &&
//               SlateElement.isElement(n) &&
//               n.type === 'check-list-item',
//           })
//           return
//         }
//       }
//     }

//     deleteBackward(...args)
//   }

//   return editor
// }

// const Element = (props) => {
//   const { attributes, children, element } = props

//   switch (element.type) {
//     case 'check-list-item':
//       return <CheckListItemElement {...props} />
//     default:
//       return <p {...attributes}>{children}</p>
//   }
// }

// const CheckListItemElement = ({
//   attributes,
//   children,
//   element,
//   onDragStart,
//   onDragOver,
//   onDrop,
// }) => {
//   const editor = useSlateStatic()
//   const readOnly = useReadOnly()
//   const { checked } = element
//   return (
//     <div
//       {...attributes}
//       draggable
//       onDragStart={(e) => onDragStart(e, element)}
//       onDragOver={onDragOver}
//       onDrop={(e) => onDrop(e, element)}
//       className={css`
//         display: flex;
//         flex-direction: row;
//         align-items: center;

//         & + & {
//           margin-top: 0;
//         }
//       `}
//     >
//       <span
//         contentEditable={false}
//         className={css`
//           margin-right: 0.75em;
//         `}
//       >
//         <input
//           type="checkbox"
//           checked={checked}
//           onChange={(event) => {
//             const path = ReactEditor.findPath(editor, element)
//             const newProperties: Partial<SlateElement> = {
//               checked: event.target.checked,
//             }
//             Transforms.setNodes(editor, newProperties, { at: path })
//           }}
//         />
//       </span>
//       <span
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         className={css`
//           flex: 1;
//           opacity: ${checked ? 0.666 : 1};
//           text-decoration: ${!checked ? 'none' : 'line-through'};

//           &:focus {
//             outline: none;
//           }
//         `}
//       >
//         {children}
//       </span>
//     </div>
//   )
// }

// export default AchievementForm

// const initialValue = [
//   {
//     children: [
//       {
//         id: uuidv4(),
//         type: 'paragraph',
//         children: [
//           {
//             text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
//           },
//         ],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: true,
//         children: [{ text: 'Slide to the left.' }],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: true,
//         children: [{ text: 'Slide to the right.' }],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: false,
//         children: [{ text: 'Criss-cross.' }],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: true,
//         children: [{ text: 'Criss-cross!' }],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: false,
//         children: [{ text: 'Cha cha real smooth…' }],
//       },
//       {
//         id: uuidv4(),
//         type: 'check-list-item',
//         checked: false,
//         children: [{ text: "Let's go to work!" }],
//       },
//       {
//         id: uuidv4(),
//         type: 'paragraph',
//         children: [{ text: 'Try it out for yourself!' }],
//       },
//     ],
//   },
// ]

// Assuming each item in initialValue has a unique 'id' property
// const initialValue: Descendant[] = [
//   {
//     id: uuidv4(),
//     type: 'paragraph',
//     children: [
//       {
//         text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
//       },
//     ],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the left.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the right.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Criss-cross.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Criss-cross!' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Cha cha real smooth…' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: "Let's go to work!" }],
//   },
//   {
//     id: uuidv4(),
//     type: 'paragraph',
//     children: [{ text: 'Try it out for yourself!' }],
//   },
// ]

// const AchievementForm = () => {
//   const [value, setValue] = useState(initialValue) // initialize state with initialValue
//   const editor = useMemo(() => withHistory(withReact(createEditor())), [])

//   // Add a console log to inspect the state just before rendering
//   console.log('Value State:', value)

//   // const onDragEnd = useCallback(
//   //   (result) => {
//   //     const { source, destination } = result

//   //     // Dropped outside the list or no movement
//   //     if (!destination || source.index === destination.index) {
//   //       return
//   //     }

//   //     const newValue = Array.from(value)
//   //     const [movedItem] = newValue.splice(source.index, 1)
//   //     newValue.splice(destination.index, 0, movedItem)

//   //     setValue(newValue)

//   //     // Update the Slate editor's value
//   //     Transforms.moveNodes(editor, {
//   //       at: [source.index],
//   //       to: [destination.index],
//   //     })
//   //   },
//   //   [value, editor]
//   // )

//   // Render function for Slate elements
//   // const renderElement = useCallback((props) => {
//   //   return <Element {...props} />
//   // }, [])

//   return (
//     <Slate
//       editor={editor}
//       value={value}
//       onChange={(value) => {
//         setValue(value)
//         console.log('val', value)
//       }}
//     >
//       <Editable placeholder="Enter some plain text..." />
//     </Slate>
//   )

//   // return (
//   //   <Slate editor={editor} value={value}>
//   //     <DragDropContext onDragEnd={onDragEnd}>
//   //       <Droppable droppableId="droppable-list">
//   //         {(provided) => (
//   //           <div {...provided.droppableProps} ref={provided.innerRef}>
//   //             {value.map((item, index) => (
//   //               <Draggable key={item.id} draggableId={item.id} index={index}>
//   //                 {(provided) => (
//   //                   <div
//   //                     ref={provided.innerRef}
//   //                     {...provided.draggableProps}
//   //                     {...provided.dragHandleProps}
//   //                     className={css`
//   //                       /* your styles here */
//   //                     `}
//   //                   >
//   //                     <Editable renderElement={renderElement} readOnly />
//   //                   </div>
//   //                 )}
//   //               </Draggable>
//   //             ))}
//   //             {provided.placeholder}
//   //           </div>
//   //         )}
//   //       </Droppable>
//   //     </DragDropContext>
//   //   </Slate>
//   // )
// }

// const Element = ({ attributes, children, element }) => {
//   switch (element.type) {
//     case 'check-list-item':
//       return <CheckListItemElement {...{ attributes, children, element }} />
//     default:
//       return <p {...attributes}>{children}</p>
//   }
// }

// const CheckListItemElement = ({ attributes, children, element }) => {
//   return (
//     <div
//       {...attributes}
//       className={css`
//         /* your styles here */
//       `}
//     >
//       {/* your check list item structure here */}
//       {children}
//     </div>
//   )
// }

// export default AchievementForm

// const initialValue: Descendant[] = [
//   {
//     id: uuidv4(),
//     type: 'paragraph',
//     children: [
//       {
//         text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
//       },
//     ],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the left.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Slide to the right.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Criss-cross.' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: true,
//     children: [{ text: 'Criss-cross!' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: 'Cha cha real smooth…' }],
//   },
//   {
//     id: uuidv4(),
//     type: 'check-list-item',
//     checked: false,
//     children: [{ text: "Let's go to work!" }],
//   },
//   {
//     id: uuidv4(),
//     type: 'paragraph',
//     children: [{ text: 'Try it out for yourself!' }],
//   },
// ]

// const AchievementForm = () => {
//   const editor = useMemo(() => withHistory(withReact(createEditor())), [])
//   return (
//     <Slate editor={editor} initialValue={initialValue}>
//       <Editable placeholder="Enter some plain text..." />
//     </Slate>
//   )
// }

// export default AchievementForm
