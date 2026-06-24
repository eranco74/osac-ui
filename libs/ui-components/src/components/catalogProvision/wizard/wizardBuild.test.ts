import { describe, expect, it } from 'vitest';

import type { ComputeInstanceCatalogItem } from '@osac/types';

import {
  buildComputeInstanceCreatePayload,
  createEmptyComputeInstanceValues,
} from './adapters/computeInstance/payload';
import { VM_CREATE_CORES, VM_CREATE_MEMORY_GIB } from './adapters/computeInstance/fields';
import { getWizardOrderedSteps } from './stepIds';

const catalogItem = {
  id: 'catalog-rhel-9',
  metadata: { name: 'catalog-rhel-9' },
  title: 'RHEL 9 catalog',
  template: 'tpl-rhel-9',
  published: true,
  fieldDefinitions: [
    {
      path: 'spec.image.source_ref',
      displayName: 'VM image',
      editable: true,
    },
    {
      path: 'spec.run_strategy',
      displayName: 'Run strategy',
      editable: true,
      default: 'Halted',
    },
  ],
} as unknown as ComputeInstanceCatalogItem;

describe('getWizardOrderedSteps', () => {
  it('returns the fixed five-step VM flow', () => {
    expect(getWizardOrderedSteps()).toEqual([
      'catalog',
      'general',
      'configuration',
      'networking',
      'review',
    ]);
  });
});

describe('buildComputeInstanceCreatePayload', () => {
  it('maps wizard values to compute instance create body with hardcoded sizing', () => {
    const values = {
      ...createEmptyComputeInstanceValues(),
      catalogItemId: 'catalog-rhel-9',
      metadata: { name: 'web-01' },
      spec: {
        ...createEmptyComputeInstanceValues().spec,
        image: { sourceRef: 'quay.io/example/rhel9' },
        isWindows: true,
        runStrategy: 'Always' as const,
        networking: {
          virtualNetworkId: 'vn-1',
          subnetId: 'subnet-1',
          securityGroupId: 'sg-1',
        },
      },
    };

    const vm = buildComputeInstanceCreatePayload(values, catalogItem);
    expect(vm.metadata?.name).toBe('web-01');
    expect(vm.spec?.catalogItem).toBe('catalog-rhel-9');
    expect(vm.spec?.cores).toBe(VM_CREATE_CORES);
    expect(vm.spec?.memoryGib).toBe(VM_CREATE_MEMORY_GIB);
    expect(vm.spec?.image).toEqual({
      sourceType: 'registry',
      sourceRef: 'quay.io/example/rhel9',
    });
    expect(vm.spec?.runStrategy).toBe('Always');
    expect(vm.spec?.networkAttachments).toEqual([
      { subnet: 'subnet-1', securityGroups: ['sg-1'] },
    ]);
    expect(vm.spec?.isWindows).toBeUndefined();
    expect(vm.spec?.instanceType).toBeUndefined();
  });

  it('omits optional ssh key, user data, and boot disk when blank', () => {
    const values = {
      ...createEmptyComputeInstanceValues(),
      catalogItemId: 'catalog-rhel-9',
      metadata: { name: 'web-02' },
      spec: {
        ...createEmptyComputeInstanceValues().spec,
        image: { sourceRef: 'quay.io/example/rhel9' },
        runStrategy: 'Halted' as const,
        networking: {
          virtualNetworkId: 'vn-1',
          subnetId: 'subnet-1',
          securityGroupId: 'sg-1',
        },
      },
    };

    const vm = buildComputeInstanceCreatePayload(values, catalogItem);
    expect(vm.spec?.sshKey).toBeUndefined();
    expect(vm.spec?.userData).toBeUndefined();
    expect(vm.spec?.bootDisk).toBeUndefined();
  });

  it('includes optional fields when provided', () => {
    const values = {
      ...createEmptyComputeInstanceValues(),
      catalogItemId: 'catalog-rhel-9',
      metadata: { name: 'web-03' },
      spec: {
        ...createEmptyComputeInstanceValues().spec,
        sshKey: 'ssh-rsa AAAA',
        userData: '#cloud-config',
        bootDisk: { sizeGib: '64' },
        image: { sourceRef: 'quay.io/example/rhel9' },
        runStrategy: 'Always' as const,
        networking: {
          virtualNetworkId: 'vn-1',
          subnetId: 'subnet-1',
          securityGroupId: 'sg-1',
        },
      },
    };

    const vm = buildComputeInstanceCreatePayload(values, catalogItem);
    expect(vm.spec?.sshKey).toBe('ssh-rsa AAAA');
    expect(vm.spec?.userData).toBe('#cloud-config');
    expect(vm.spec?.bootDisk).toEqual({ sizeGib: 64 });
  });
});
