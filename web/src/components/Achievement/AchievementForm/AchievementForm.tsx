import { FieldError, Form, FormError, Submit, TextField } from '@redwoodjs/forms';

import type { EditAchievementById, UpdateAchievementInput } from 'types/graphql'

import type { RWGqlError } from '@redwoodjs/forms'

type FormAchievement = NonNullable<EditAchievementById['achievement']>

interface AchievementFormProps {
  achievement?: EditAchievementById['achievement']
  onSave: (data: UpdateAchievementInput, id?: FormAchievement['id']) => void
  error: RWGqlError
  loading: boolean
}

const AchievementForm = (props: AchievementFormProps) => {
  const onSubmit = (data: FormAchievement) => {
    props.onSave(data, props?.achievement?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormAchievement> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* <Label
          name="body"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Body
        </Label> */}

        <TextField
          name="body"
          defaultValue={props.achievement?.body}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="body" className="rw-field-error" />

        {/* <Label
          name="resumeId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Resume id
        </Label> */}

        {/* <NumberField
          name="resumeId"
          defaultValue={props.achievement?.resumeId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="resumeId" className="rw-field-error" /> */}

        {/* <div className="rw-button-group"> */}
        <Submit disabled={props.loading} className="rw-button rw-button-blue">
          Save
        </Submit>
        {/* </div> */}
      </Form>
    </div>
  )
}

export default AchievementForm
