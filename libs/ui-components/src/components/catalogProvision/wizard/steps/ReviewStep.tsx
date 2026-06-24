import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import type { ComputeInstanceCatalogItem } from '@osac/types';

import type { BuildComputeInstanceCreateBodyInput } from '../../../../api/v1/compute-instance-wire';
import { useTranslation } from '../../../../hooks/useTranslation';
import { SubtleContent } from '../../../SubtleContent/SubtleContent';
import type { ComputeInstanceWizardValues } from '../adapters/computeInstance/fields';
import type { CatalogProvisionAdapter } from '../adapters/types';

interface Props {
  adapter: CatalogProvisionAdapter<
    ComputeInstanceCatalogItem,
    ComputeInstanceWizardValues,
    BuildComputeInstanceCreateBodyInput
  >;
  catalogItem: ComputeInstanceCatalogItem | null;
  values: ComputeInstanceWizardValues;
}

export const ReviewStep = ({
  adapter,
  catalogItem,
  values,
}: Props) => {
  const { t } = useTranslation();
  const sections = catalogItem ? adapter.getReviewSections(values, catalogItem) : [];

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="xl">
          {t('catalogProvision.steps.review.title')}
        </Title>
        <SubtleContent component="p">
          {t('catalogProvision.steps.review.intro', {
            action: t('catalogProvision.actions.create').toLowerCase(),
          })}
        </SubtleContent>
      </StackItem>
      <StackItem>
        <DescriptionList isCompact aria-labelledby="review-heading">
          <DescriptionListGroup>
            <DescriptionListTerm>{t('catalogProvision.review.catalogItem')}</DescriptionListTerm>
            <DescriptionListDescription>{catalogItem?.title ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          {sections.map((section) => (
            <DescriptionListGroup key={section.title}>
              <DescriptionListTerm>{section.title}</DescriptionListTerm>
              <DescriptionListDescription>
                {section.rows.map((row) => (
                  <div key={`${section.title}-${row.label}`}>
                    <strong>{row.label}:</strong> {row.value}
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
