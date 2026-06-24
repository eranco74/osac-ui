/** Hardcoded sizing until instance type API is available in the deployment. */
export const VM_CREATE_CORES = 4;
export const VM_CREATE_MEMORY_GIB = 8;

export const VM_RUN_STRATEGY_OPTIONS = ['Always', 'Halted'] as const;

export type VmRunStrategy = (typeof VM_RUN_STRATEGY_OPTIONS)[number];

export interface ComputeInstanceNetworkingValues {
  virtualNetworkId: string;
  subnetId: string;
  securityGroupId: string;
}

export interface ComputeInstanceWizardValues {
  catalogItemId: string;
  metadata: {
    name: string;
  };
  spec: {
    sshKey: string;
    image: {
      sourceRef: string;
    };
    isWindows: boolean;
    userData: string;
    bootDisk: {
      sizeGib: string;
    };
    runStrategy: VmRunStrategy;
    networking: ComputeInstanceNetworkingValues;
  };
}

export const CONFIGURATION_CATALOG_PATHS = [
  'spec.image.source_ref',
  'spec.user_data',
  'spec.boot_disk.size_gib',
  'spec.run_strategy',
] as const;

import type { WizardStepId } from '../../stepIds';

export const WIZARD_STEP_FIELD_PATHS: Record<WizardStepId, string[]> = {
  catalog: ['catalogItemId'],
  general: ['metadata.name', 'spec.sshKey'],
  configuration: [
    'spec.image.sourceRef',
    'spec.isWindows',
    'spec.userData',
    'spec.bootDisk.sizeGib',
    'spec.runStrategy',
  ],
  networking: [
    'spec.networking.virtualNetworkId',
    'spec.networking.subnetId',
    'spec.networking.securityGroupId',
  ],
  review: [],
};
