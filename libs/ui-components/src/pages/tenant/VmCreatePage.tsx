import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';

import { useProvisionComputeInstance } from '@osac/ui-components/api/v1/compute-instance';
import type { BuildComputeInstanceCreateBodyInput } from '@osac/ui-components/api/v1/compute-instance-wire';
import {
  CatalogProvisionWizard,
  type CatalogProvisionWizardCloseHandler,
} from '@osac/ui-components/components/catalogProvision/CatalogProvisionWizard';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

export const VmCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { catalogItemId } = useParams<{ catalogItemId?: string }>();
  const provisionVm = useProvisionComputeInstance();
  const [closeHandler, setCloseHandler] = useState<CatalogProvisionWizardCloseHandler | null>(
    null,
  );

  const handleCloseHandlerChange = useCallback((handler: CatalogProvisionWizardCloseHandler) => {
    setCloseHandler(handler);
  }, []);

  const handleWizardClosed = useCallback(() => {
    navigate('/vms');
  }, [navigate]);

  const handleWizardProvision = useCallback(
    async (vm: BuildComputeInstanceCreateBodyInput) => {
      const created = await provisionVm.mutateAsync({
        vm,
        specCatalogItemOnly: true,
      });
      if (!created.id) {
        throw new Error('Create response missing id');
      }
      navigate(`/vms/${created.id}`);
    },
    [navigate, provisionVm],
  );

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <Breadcrumb>
            <BreadcrumbItem>
              <Button
                variant="link"
                isInline
                onClick={() => closeHandler?.requestClose()}
                isDisabled={closeHandler?.pending}
              >
                {t('Virtual Machines')}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('catalogProvision.vm.breadcrumbCreate')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {t('catalogProvision.vm.wizardTitle')}
          </Title>
          <Content component="p">{t('catalogProvision.vm.wizardDescription')}</Content>
        </Stack>
      </PageSection>
      <CatalogProvisionWizard
        initialCatalogItemId={catalogItemId}
        onProvision={handleWizardProvision}
        onClosed={handleWizardClosed}
        onCloseHandlerChange={handleCloseHandlerChange}
      />
    </>
  );
};
