import type { ComputeInstanceCatalogItem } from '@osac/types';

import type { BuildComputeInstanceCreateBodyInput } from '../../../../../api/v1/compute-instance-wire';
import type { ComputeInstanceWizardValues } from './fields';
import { VM_CREATE_CORES, VM_CREATE_MEMORY_GIB, VM_RUN_STRATEGY_OPTIONS } from './fields';

export const createEmptyComputeInstanceValues = (): ComputeInstanceWizardValues => ({
  catalogItemId: '',
  metadata: { name: '' },
  spec: {
    sshKey: '',
    image: { sourceRef: '' },
    isWindows: false,
    userData: '',
    bootDisk: { sizeGib: '' },
    runStrategy: VM_RUN_STRATEGY_OPTIONS[0],
    networking: {
      virtualNetworkId: '',
      subnetId: '',
      securityGroupId: '',
    },
  },
});

export const buildComputeInstanceCreatePayload = (
  values: ComputeInstanceWizardValues,
  catalogItem: ComputeInstanceCatalogItem,
): BuildComputeInstanceCreateBodyInput => {
  const spec: Record<string, unknown> = {
    catalogItem: catalogItem.id,
    cores: VM_CREATE_CORES,
    memoryGib: VM_CREATE_MEMORY_GIB,
    image: {
      sourceType: 'registry',
      sourceRef: values.spec.image.sourceRef.trim(),
    },
    runStrategy: values.spec.runStrategy,
    networkAttachments: [
      {
        subnet: values.spec.networking.subnetId,
        securityGroups: values.spec.networking.securityGroupId
          ? [values.spec.networking.securityGroupId]
          : [],
      },
    ],
  };

  const sshKey = values.spec.sshKey.trim();
  if (sshKey) {
    spec.sshKey = sshKey;
  }

  const userData = values.spec.userData.trim();
  if (userData) {
    spec.userData = userData;
  }

  const bootDiskRaw = values.spec.bootDisk.sizeGib.trim();
  if (bootDiskRaw) {
    spec.bootDisk = { sizeGib: Number(bootDiskRaw) };
  }

  return {
    metadata: { name: values.metadata.name.trim() },
    spec,
  };
};
