import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { useField } from 'formik';

import { FormFieldHelper } from '../Form/FormFieldHelper';

export interface SelectFieldOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

interface SelectFieldProps {
  name: string;
  label: string;
  fieldId: string;
  options: SelectFieldOption[];
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

export const SelectField = ({
  name,
  label,
  fieldId,
  options,
  isRequired = false,
  isDisabled = false,
  placeholder,
}: SelectFieldProps) => {
  const [field, meta] = useField<string>(name);
  const error = meta.touched && meta.error ? String(meta.error) : undefined;
  const validated = error ? 'error' : 'default';

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired}>
      <FormSelect
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
        placeholder={placeholder}
      >
        {options.map((option) => (
          <FormSelectOption
            key={option.value}
            value={option.value}
            label={option.label}
            isDisabled={option.isDisabled}
          />
        ))}
      </FormSelect>
      <FormFieldHelper error={error} fieldId={fieldId} />
    </FormGroup>
  );
};
