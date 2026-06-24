import { FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import { useField } from 'formik';

import { useShowFieldValidationErrors } from './FieldValidationContext';
import { FormFieldHelper } from './FormFieldHelper';
import { getVisibleFieldError } from './fieldError';

interface InputFieldProps {
  name: string;
  label: string;
  fieldId: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  multiline?: boolean;
  type?: 'text' | 'number' | 'password';
  helperText?: string;
}

export const InputField = ({
  name,
  label,
  fieldId,
  isRequired = false,
  isDisabled = false,
  multiline = false,
  type = 'text',
  helperText,
}: InputFieldProps) => {
  const [field, meta] = useField<string>(name);
  const showValidationErrors = useShowFieldValidationErrors();
  const error = getVisibleFieldError(meta, showValidationErrors);
  const validated = error ? 'error' : 'default';

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired}>
      {multiline ? (
        <TextArea
          id={fieldId}
          name={name}
          value={field.value ?? ''}
          onChange={(_event, value) => {
            void field.onChange({ target: { name, value } });
          }}
          onBlur={field.onBlur}
          isDisabled={isDisabled}
          validated={validated}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-helper-error` : undefined}
        />
      ) : (
        <TextInput
          id={fieldId}
          name={name}
          type={type}
          value={field.value ?? ''}
          onChange={(_event, value) => {
            void field.onChange({ target: { name, value } });
          }}
          onBlur={field.onBlur}
          isDisabled={isDisabled}
          validated={validated}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-helper-error` : undefined}
        />
      )}
      {helperText && !error ? <FormFieldHelper error={helperText} fieldId={fieldId} /> : null}
      <FormFieldHelper error={error} fieldId={fieldId} />
    </FormGroup>
  );
};
