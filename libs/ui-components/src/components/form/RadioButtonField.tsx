import { FormGroup, Radio } from '@patternfly/react-core';
import { useField } from 'formik';

import { FormFieldHelper } from '../Form/FormFieldHelper';

export interface RadioButtonFieldOption {
  value: string;
  label: string;
}

interface RadioButtonFieldProps {
  name: string;
  label: string;
  fieldId: string;
  options: RadioButtonFieldOption[];
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const RadioButtonField = ({
  name,
  label,
  fieldId,
  options,
  isRequired = false,
  isDisabled = false,
}: RadioButtonFieldProps) => {
  const [field, meta] = useField<string | boolean>(name);
  const error = meta.touched && meta.error ? String(meta.error) : undefined;
  const stringValue =
    field.value === true ? 'true' : field.value === false ? 'false' : String(field.value ?? '');

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired} role="group">
      {options.map((option) => (
        <Radio
          key={option.value}
          id={`${fieldId}-${option.value}`}
          name={name}
          label={option.label}
          isChecked={stringValue === option.value}
          isDisabled={isDisabled}
          onChange={() => {
            const parsed =
              option.value === 'true' ? true : option.value === 'false' ? false : option.value;
            void field.onChange({ target: { name, value: parsed } });
          }}
          onBlur={field.onBlur}
        />
      ))}
      <FormFieldHelper error={error} fieldId={fieldId} />
    </FormGroup>
  );
};
