import type { CatalogProvisionAdapter } from './types';
import type { CatalogProvisionCatalogItem } from '../../catalogProvisionItem';
import type { ComputeInstanceWizardValues } from './computeInstance/fields';
import { createEmptyComputeInstanceValues } from './computeInstance/payload';

/** Placeholder until cluster catalog provisioning is implemented. */
export const clusterAdapter: CatalogProvisionAdapter<
  CatalogProvisionCatalogItem,
  ComputeInstanceWizardValues,
  Record<string, never>
> = {
  kind: 'cluster',
  useCatalogItems: () => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: () => undefined,
  }),
  getInitialValues: () => createEmptyComputeInstanceValues(),
  buildCreatePayload: () => ({}),
  ConfigurationStep: () => null,
  NetworkingStep: () => null,
  resolveGeneralFields: () => [],
  getWizardSchema: () => undefined,
  getStepFieldPaths: () => [],
  getReviewSections: () => [],
  wizardTitleKey: 'catalogProvision.cluster.wizardTitle',
  wizardDescriptionKey: 'catalogProvision.cluster.wizardDescription',
  breadcrumbCreateLabelKey: 'catalogProvision.cluster.breadcrumbCreate',
  ariaLabelKey: 'catalogProvision.cluster.ariaLabel',
};
