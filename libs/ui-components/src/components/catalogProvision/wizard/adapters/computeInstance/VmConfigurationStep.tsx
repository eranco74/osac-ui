import { useMemo } from 'react';
import { Stack, StackItem, Title } from '@patternfly/react-core';

import type { ComputeInstanceCatalogItem } from '@osac/types';

import { VM_RUN_STRATEGY_OPTIONS } from './fields';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { InputField } from '../../../../Form/InputField';
import OsacForm from '../../../../Form/OsacForm';
import { RadioButtonField } from '../../../../Form/RadioButtonField';
import { SelectField } from '../../../../Form/SelectField';
import { SubtleContent } from '../../../../SubtleContent/SubtleContent';
import {
  getCatalogFieldOverlay,
  readCatalogFieldDefinitions,
} from '../../catalogOverlay';

interface Props {
  catalogItem: ComputeInstanceCatalogItem | null;
}

export const VmConfigurationStep = ({ catalogItem }: Props) => {
  const { t } = useTranslation();

  const definitions = useMemo(
    () => readCatalogFieldDefinitions(catalogItem),
    [catalogItem],
  );

  const overlays = useMemo(
    () => ({
      image: getCatalogFieldOverlay(
        'spec.image.source_ref',
        definitions,
        t('catalogProvision.vm.fields.image'),
      ),
      userData: getCatalogFieldOverlay(
        'spec.user_data',
        definitions,
        t('catalogProvision.vm.fields.userData'),
      ),
      bootDisk: getCatalogFieldOverlay(
        'spec.boot_disk.size_gib',
        definitions,
        t('catalogProvision.vm.fields.bootDisk'),
      ),
      runStrategy: getCatalogFieldOverlay(
        'spec.run_strategy',
        definitions,
        t('catalogProvision.vm.fields.runStrategy'),
      ),
    }),
    [definitions, t],
  );

  if (!catalogItem) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="xl">
            {t('catalogProvision.steps.configuration.title')}
          </Title>
          <SubtleContent component="p">
            {t('catalogProvision.steps.configuration.selectCatalogItem')}
          </SubtleContent>
        </StackItem>
      </Stack>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="xl">
          {t('catalogProvision.steps.configuration.title')}
        </Title>
        <SubtleContent component="p">
          {t('catalogProvision.steps.configuration.intro')}
        </SubtleContent>
      </StackItem>
      <StackItem>
        <OsacForm>
          <InputField
            name="spec.image.sourceRef"
            label={overlays.image.label}
            fieldId="vm-image-source-ref"
            isRequired
            isDisabled={!overlays.image.editable}
          />
          <RadioButtonField
            name="spec.isWindows"
            label={t('catalogProvision.vm.fields.osFamily')}
            fieldId="vm-os-family"
            isRequired
            options={[
              { value: 'false', label: t('catalogProvision.vm.osFamily.linux') },
              { value: 'true', label: t('catalogProvision.vm.osFamily.windows') },
            ]}
          />
          <InputField
            name="spec.userData"
            label={overlays.userData.label}
            fieldId="vm-user-data"
            multiline
            isDisabled={!overlays.userData.editable}
          />
          <InputField
            name="spec.bootDisk.sizeGib"
            label={overlays.bootDisk.label}
            fieldId="vm-boot-disk-size"
            type="number"
            isDisabled={!overlays.bootDisk.editable}
          />
          <SelectField
            name="spec.runStrategy"
            label={overlays.runStrategy.label}
            fieldId="vm-run-strategy"
            isRequired
            isDisabled={!overlays.runStrategy.editable}
            options={VM_RUN_STRATEGY_OPTIONS.map((value) => ({
              value,
              label: value,
            }))}
          />
        </OsacForm>
      </StackItem>
    </Stack>
  );
};
