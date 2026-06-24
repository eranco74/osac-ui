import type { TFunction } from 'i18next';
import * as yup from 'yup';

import { VM_RUN_STRATEGY_OPTIONS } from './fields';
import {
  getCatalogFieldOverlay,
  mergeCatalogValidation,
  readCatalogFieldDefinitions,
} from '../../catalogOverlay';

export const buildComputeInstanceWizardSchema = (
  catalogItem: unknown,
  t: TFunction,
): yup.AnyObjectSchema => {
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

  return yup.object({
    catalogItemId: yup.string().required(t('catalogProvision.validation.catalogItemRequired')),
    metadata: yup.object({
      name: yup.string().trim().required(t('catalogProvision.validation.nameRequired')),
    }),
    spec: yup.object({
      sshKey: mergeCatalogValidation(
        yup.string(),
        sshKeyOverlay,
        false,
        t('catalogProvision.validation.required'),
      ),
      image: yup.object({
        sourceRef: mergeCatalogValidation(
          yup.string().trim(),
          imageOverlay,
          true,
          t('catalogProvision.validation.imageRequired'),
        ),
      }),
      isWindows: yup.boolean().required(),
      userData: mergeCatalogValidation(
        yup.string(),
        userDataOverlay,
        false,
        t('catalogProvision.validation.required'),
      ),
      bootDisk: yup.object({
        sizeGib: mergeCatalogValidation(
          yup
            .string()
            .test(
              'boot-disk-number',
              t('catalogProvision.validation.bootDiskNumber'),
              (value) => !value?.trim() || !Number.isNaN(Number(value)),
            ),
          bootDiskOverlay,
          false,
          t('catalogProvision.validation.required'),
        ),
      }),
      runStrategy: mergeCatalogValidation(
        yup.string().oneOf([...VM_RUN_STRATEGY_OPTIONS]),
        runStrategyOverlay,
        true,
        t('catalogProvision.validation.runStrategyRequired'),
      ),
      networking: yup.object({
        virtualNetworkId: yup
          .string()
          .required(t('catalogProvision.validation.virtualNetworkRequired')),
        subnetId: yup.string().required(t('catalogProvision.validation.subnetRequired')),
        securityGroupId: yup
          .string()
          .required(t('catalogProvision.validation.securityGroupRequired')),
      }),
    }),
  });
};
