import { Stack, StackItem, Title } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InputField } from '../../../Form/InputField';
import OsacForm from '../../../Form/OsacForm';
import { SubtleContent } from '../../../SubtleContent/SubtleContent';
import type { GeneralFieldDescriptor } from '../adapters/types';

interface Props {
  fields: GeneralFieldDescriptor[];
}

export const GeneralStep = ({ fields }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="xl">
          {t('catalogProvision.steps.general.title')}
        </Title>
        <SubtleContent component="p">{t('catalogProvision.steps.general.intro')}</SubtleContent>
      </StackItem>
      <StackItem>
        <OsacForm>
          {fields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label ?? t(field.labelKey)}
              fieldId={field.name.replace(/\./g, '-')}
              isRequired={field.isRequired}
              isDisabled={field.isDisabled}
              multiline={field.multiline}
              type={field.isPassword ? 'password' : 'text'}
            />
          ))}
        </OsacForm>
      </StackItem>
    </Stack>
  );
};

interface CatalogFormValues {
  catalogItemId: string;
}

export const useSelectedCatalogItemId = (): string =>
  useFormikContext<CatalogFormValues>().values.catalogItemId;
