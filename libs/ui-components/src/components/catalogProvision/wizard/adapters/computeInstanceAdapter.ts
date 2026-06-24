import { useMemo } from 'react';
import type { TFunction } from 'i18next';

import type { ComputeInstanceCatalogItem } from '@osac/types';

import { applyVmCatalogConfigurationDefaults } from './computeInstance/applyCatalogDefaults';
import { applyVmCatalogGeneralDefaults } from './computeInstance/applyCatalogGeneralDefaults';
import type { ComputeInstanceWizardValues } from './computeInstance/fields';
import { WIZARD_STEP_FIELD_PATHS } from './computeInstance/fields';
import { buildVmGeneralFields } from './computeInstance/generalFields';
import { buildComputeInstanceCreatePayload, createEmptyComputeInstanceValues } from './computeInstance/payload';
import { buildComputeInstanceWizardSchema } from './computeInstance/schemas';
import { VmConfigurationStep } from './computeInstance/VmConfigurationStep';
import { VmNetworkingStep } from './computeInstance/VmNetworkingStep';
import { useComputeInstanceCatalogItems } from '../../../../api/v1/compute-instance-catalog-item';
import type { BuildComputeInstanceCreateBodyInput } from '../../../../api/v1/compute-instance-wire';
import { useTranslation } from '../../../../hooks/useTranslation';
import {
  type ReviewSection,
  formatReviewScalar,
  getCatalogFieldOverlay,
  readCatalogFieldDefinitions,
  reviewRow,
} from '../catalogOverlay';
import type { CatalogProvisionAdapter } from './types';

export { buildComputeInstanceCreatePayload, createEmptyComputeInstanceValues } from './computeInstance/payload';

const buildReviewSections = (
  values: ComputeInstanceWizardValues,
  catalogItem: ComputeInstanceCatalogItem,
  t: TFunction,
): ReviewSection[] => {
  const definitions = readCatalogFieldDefinitions(catalogItem);
  const imageOverlay = getCatalogFieldOverlay(
    'spec.image.source_ref',
    definitions,
    t('catalogProvision.vm.fields.image'),
  );
  const userDataOverlay = getCatalogFieldOverlay(
    'spec.user_data',
    definitions,
    t('catalogProvision.vm.fields.userData'),
  );
  const bootDiskOverlay = getCatalogFieldOverlay(
    'spec.boot_disk.size_gib',
    definitions,
    t('catalogProvision.vm.fields.bootDisk'),
  );
  const runStrategyOverlay = getCatalogFieldOverlay(
    'spec.run_strategy',
    definitions,
    t('catalogProvision.vm.fields.runStrategy'),
  );
  const sshKeyOverlay = getCatalogFieldOverlay(
    'ssh_key',
    definitions,
    t('catalogProvision.vm.fields.sshKey'),
  );

  return [
    {
      title: t('catalogProvision.steps.general.title'),
      rows: [
        reviewRow(t('catalogProvision.vm.fields.name'), formatReviewScalar(values.metadata.name)),
        reviewRow(
          sshKeyOverlay.label,
          formatReviewScalar(values.spec.sshKey, true),
        ),
      ],
    },
    {
      title: t('catalogProvision.steps.configuration.title'),
      rows: [
        reviewRow(imageOverlay.label, formatReviewScalar(values.spec.image.sourceRef)),
        reviewRow(
          t('catalogProvision.vm.fields.osFamily'),
          values.spec.isWindows
            ? t('catalogProvision.vm.osFamily.windows')
            : t('catalogProvision.vm.osFamily.linux'),
        ),
        reviewRow(userDataOverlay.label, formatReviewScalar(values.spec.userData, true)),
        reviewRow(bootDiskOverlay.label, formatReviewScalar(values.spec.bootDisk.sizeGib)),
        reviewRow(runStrategyOverlay.label, formatReviewScalar(values.spec.runStrategy)),
      ],
    },
    {
      title: t('catalogProvision.steps.networking.title'),
      rows: [
        reviewRow(
          t('catalogProvision.vm.fields.virtualNetwork'),
          formatReviewScalar(values.spec.networking.virtualNetworkId),
        ),
        reviewRow(
          t('catalogProvision.vm.fields.subnet'),
          formatReviewScalar(values.spec.networking.subnetId),
        ),
        reviewRow(
          t('catalogProvision.vm.fields.securityGroup'),
          formatReviewScalar(values.spec.networking.securityGroupId),
        ),
      ],
    },
  ];
};

export const useComputeInstanceAdapter = (): CatalogProvisionAdapter<
  ComputeInstanceCatalogItem,
  ComputeInstanceWizardValues,
  BuildComputeInstanceCreateBodyInput
> => {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      kind: 'compute_instance' as const,
      useCatalogItems: () => {
        const query = useComputeInstanceCatalogItems();
        return {
          data: query.data ?? [],
          isPending: query.isPending,
          isError: query.isError,
          refetch: () => {
            void query.refetch();
          },
        };
      },
      getInitialValues: (_catalogItem) => createEmptyComputeInstanceValues(),
      buildCreatePayload: buildComputeInstanceCreatePayload,
      ConfigurationStep: VmConfigurationStep,
      NetworkingStep: VmNetworkingStep,
      resolveGeneralFields: (catalogItem) => buildVmGeneralFields(catalogItem, t),
      getWizardSchema: (catalogItem) => buildComputeInstanceWizardSchema(catalogItem, t),
      getStepFieldPaths: (stepId) => WIZARD_STEP_FIELD_PATHS[stepId] ?? [],
      getReviewSections: (values, catalogItem) => buildReviewSections(values, catalogItem, t),
      onCatalogItemSelected: (item, helpers) => {
        helpers.resetForm({
          values: {
            ...createEmptyComputeInstanceValues(),
            catalogItemId: item.id,
          },
        });
        applyVmCatalogConfigurationDefaults(item, helpers, t);
        applyVmCatalogGeneralDefaults(item, helpers, t);
      },
      wizardTitleKey: 'catalogProvision.vm.wizardTitle',
      wizardDescriptionKey: 'catalogProvision.vm.wizardDescription',
      breadcrumbCreateLabelKey: 'catalogProvision.vm.breadcrumbCreate',
      ariaLabelKey: 'catalogProvision.vm.ariaLabel',
    }),
    [t],
  );
};
