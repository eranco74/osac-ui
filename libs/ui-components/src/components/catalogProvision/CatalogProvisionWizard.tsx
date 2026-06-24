/**
 * flow: catalog-provision-wizard
 * steps: catalog → general → configuration → networking → review
 */
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  Title,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { Form, Formik, type FormikProps } from 'formik';

import type { ComputeInstanceCatalogItem } from '@osac/types';

import type { CatalogProvisionKind } from './catalogFieldDefinition';
import { FieldValidationProvider } from '../Form/FieldValidationContext';
import { useTranslation } from '../../hooks/useTranslation';
import type { ComputeInstanceWizardValues } from './wizard/adapters/computeInstance/fields';
import { useComputeInstanceAdapter } from './wizard/adapters/computeInstanceAdapter';
import type { CatalogProvisionAdapter } from './wizard/adapters/types';
import { STEP_LABEL_KEYS, type WizardStepId, getWizardOrderedSteps } from './wizard/stepIds';
import { CatalogStep, GeneralStep, ReviewStep } from './wizard/steps/WizardSteps';
import { validateWizardStepFields, applyStepValidationState } from './wizard/validateStep';
import type { BuildComputeInstanceCreateBodyInput } from '../../api/v1/compute-instance-wire';

const hasWizardUnsavedProgress = (values: { catalogItemId?: string }): boolean =>
  Boolean(values.catalogItemId?.trim());

interface CatalogProvisionWizardHeaderProps {
  breadcrumbParentLabel: string;
  wizardTitle: string;
  onRequestClose: () => void;
  pending: boolean;
}

const CatalogProvisionWizardHeader = ({
  breadcrumbParentLabel,
  wizardTitle,
  onRequestClose,
  pending,
}: CatalogProvisionWizardHeaderProps) => (
  <Stack hasGutter>
    <Breadcrumb>
      <BreadcrumbItem>
        <Button variant="link" isInline onClick={onRequestClose} isDisabled={pending}>
          {breadcrumbParentLabel}
        </Button>
      </BreadcrumbItem>
      <BreadcrumbItem isActive>{wizardTitle}</BreadcrumbItem>
    </Breadcrumb>
    <Title headingLevel="h2" size="xl">
      {wizardTitle}
    </Title>
  </Stack>
);

interface Props {
  kind?: CatalogProvisionKind;
  breadcrumbParentLabel: string;
  initialCatalogItemId?: string;
  onProvision: (payload: BuildComputeInstanceCreateBodyInput) => void | Promise<void>;
  onClosed?: () => void;
}

interface WizardFooterProps {
  adapter: CatalogProvisionAdapter<
    ComputeInstanceCatalogItem,
    ComputeInstanceWizardValues,
    BuildComputeInstanceCreateBodyInput
  >;
  formik: FormikProps<ComputeInstanceWizardValues>;
  catalogItem: ComputeInstanceCatalogItem | null;
  orderedSteps: readonly WizardStepId[];
  activeStepId: WizardStepId;
  setProvisionError: (message: string | undefined) => void;
  setValidationAlert: (visible: boolean) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
  onProvision: Props['onProvision'];
  close: (options?: { notifyClosed?: boolean }) => void;
  requestClose: () => void;
}

const CatalogProvisionWizardFooter = ({
  adapter,
  formik,
  catalogItem,
  orderedSteps,
  activeStepId,
  setProvisionError,
  setValidationAlert,
  pending,
  setPending,
  onProvision,
  close,
  requestClose,
}: WizardFooterProps) => {
  const { t } = useTranslation();
  const { activeStep, goToStepByIndex } = useWizardContext();
  const stepIndex = activeStep?.index ?? 1;
  const isFirst = stepIndex <= 1;
  const isReview = activeStepId === 'review';

  const handleBack = useCallback(() => {
    if (isFirst || pending) {
      return;
    }
    setProvisionError(undefined);
    setValidationAlert(false);
    goToStepByIndex(stepIndex - 1);
  }, [goToStepByIndex, isFirst, pending, setProvisionError, setValidationAlert, stepIndex]);

  const { values } = formik;

  const validateCurrentStep = useCallback(async () => {
    const schema = adapter.getWizardSchema(catalogItem);
    const fieldPaths = adapter.getStepFieldPaths(activeStepId);
    const errors = await validateWizardStepFields(schema, values, fieldPaths);
    if (!applyStepValidationState(formik, fieldPaths, errors as never)) {
      setValidationAlert(true);
      return false;
    }
    setValidationAlert(false);
    return true;
  }, [
    activeStepId,
    adapter,
    catalogItem,
    formik,
    setValidationAlert,
    values,
  ]);

  const handleNextOrCreate = useCallback(async () => {
    if (pending) {
      return;
    }

    if (isReview) {
      const wizardSchema = adapter.getWizardSchema(catalogItem);
      for (const stepId of orderedSteps) {
        if (stepId === 'review') {
          continue;
        }
        const fieldPaths = adapter.getStepFieldPaths(stepId);
        const errors = await validateWizardStepFields(wizardSchema, values, fieldPaths);
        if (!applyStepValidationState(formik, fieldPaths, errors as never)) {
          const targetIndex = orderedSteps.indexOf(stepId) + 1;
          goToStepByIndex(targetIndex);
          setValidationAlert(true);
          return;
        }
      }

      if (!catalogItem) {
        setProvisionError(t('catalogProvision.validation.catalogItemRequired'));
        return;
      }

      setPending(true);
      setProvisionError(undefined);
      const payload = adapter.buildCreatePayload(values, catalogItem);
      try {
        await Promise.resolve(onProvision(payload));
        close({ notifyClosed: false });
      } catch {
        setProvisionError(t('catalogProvision.errors.provisionFailed'));
      } finally {
        setPending(false);
      }
      return;
    }

    const valid = await validateCurrentStep();
    if (!valid) {
      return;
    }

    setProvisionError(undefined);
    goToStepByIndex(stepIndex + 1);
  }, [
    adapter,
    catalogItem,
    close,
    goToStepByIndex,
    isReview,
    onProvision,
    orderedSteps,
    pending,
    setPending,
    setProvisionError,
    setValidationAlert,
    stepIndex,
    t,
    validateCurrentStep,
    values,
    formik,
  ]);

  return (
    <Flex
      justifyContent={{ default: 'justifyContentFlexStart' }}
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'wrap' }}
      gap={{ default: 'gapMd' }}
    >
      <Button
        variant="secondary"
        onClick={handleBack}
        isDisabled={isFirst || pending}
        isAriaDisabled={isFirst || pending}
      >
        {t('catalogProvision.actions.back')}
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          void handleNextOrCreate();
        }}
        isDisabled={pending}
        isLoading={pending}
      >
        {isReview ? t(adapter.createButtonLabelKey) : t('catalogProvision.actions.next')}
      </Button>
      <Button variant="link" onClick={requestClose} isDisabled={pending}>
        {t('catalogProvision.actions.cancel')}
      </Button>
    </Flex>
  );
};

interface WizardBodyProps {
  adapter: CatalogProvisionAdapter<
    ComputeInstanceCatalogItem,
    ComputeInstanceWizardValues,
    BuildComputeInstanceCreateBodyInput
  >;
  stepId: WizardStepId;
  catalogItem: ComputeInstanceCatalogItem | null;
  values: ComputeInstanceWizardValues;
  provisionError?: string;
  validationAlert: boolean;
}

const WizardStepBody = ({
  adapter,
  stepId,
  catalogItem,
  values,
  provisionError,
  validationAlert,
}: WizardBodyProps) => {
  const { t } = useTranslation();
  const ConfigurationStep = adapter.ConfigurationStep;
  const NetworkingStep = adapter.NetworkingStep;

  return (
    <FieldValidationProvider value={validationAlert}>
      <Stack hasGutter>
      {validationAlert ? (
        <StackItem>
          <Alert
            variant="danger"
            isInline
            title={t('catalogProvision.validation.stepInvalid')}
          />
        </StackItem>
      ) : null}
      {provisionError ? (
        <StackItem>
          <Alert variant="danger" isInline title={t('catalogProvision.errors.provisionTitle')}>
            {provisionError}
          </Alert>
        </StackItem>
      ) : null}
      {stepId === 'catalog' ? <CatalogStep adapter={adapter} /> : null}
      {stepId === 'general' ? <GeneralStep fields={adapter.generalFields} /> : null}
      {stepId === 'configuration' ? <ConfigurationStep catalogItem={catalogItem} /> : null}
      {stepId === 'networking' ? <NetworkingStep catalogItem={catalogItem} /> : null}
      {stepId === 'review' ? (
        <ReviewStep adapter={adapter} catalogItem={catalogItem} values={values} />
      ) : null}
      </Stack>
    </FieldValidationProvider>
  );
};

interface InnerProps extends Props {
  adapter: CatalogProvisionAdapter<
    ComputeInstanceCatalogItem,
    ComputeInstanceWizardValues,
    BuildComputeInstanceCreateBodyInput
  >;
  initialValues: ComputeInstanceWizardValues;
}

const CatalogProvisionWizardInner = ({
  adapter,
  breadcrumbParentLabel,
  initialCatalogItemId,
  initialValues,
  onProvision,
  onClosed,
}: InnerProps) => {
  const { t } = useTranslation();
  const orderedSteps = useMemo(() => getWizardOrderedSteps(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [provisionError, setProvisionError] = useState<string | undefined>();
  const [validationAlert, setValidationAlert] = useState(false);
  const [pending, setPending] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const activeStepId = orderedSteps[activeIndex] ?? 'catalog';

  const resetLocal = useCallback(() => {
    setActiveIndex(0);
    setProvisionError(undefined);
    setValidationAlert(false);
    setShowCancelConfirm(false);
  }, []);

  const close = useCallback(
    (options?: { notifyClosed?: boolean }) => {
      resetLocal();
      if (options?.notifyClosed !== false) {
        onClosed?.();
      }
    },
    [onClosed, resetLocal],
  );

  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {(formik) => (
        <CatalogProvisionWizardForm
          adapter={adapter}
          formik={formik}
          breadcrumbParentLabel={breadcrumbParentLabel}
          initialCatalogItemId={initialCatalogItemId}
          orderedSteps={orderedSteps}
          activeStepId={activeStepId}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          provisionError={provisionError}
          setProvisionError={setProvisionError}
          validationAlert={validationAlert}
          setValidationAlert={setValidationAlert}
          pending={pending}
          setPending={setPending}
          showCancelConfirm={showCancelConfirm}
          setShowCancelConfirm={setShowCancelConfirm}
          onProvision={onProvision}
          close={close}
          t={t}
        />
      )}
    </Formik>
  );
};

interface FormProps {
  adapter: CatalogProvisionAdapter<
    ComputeInstanceCatalogItem,
    ComputeInstanceWizardValues,
    BuildComputeInstanceCreateBodyInput
  >;
  formik: FormikProps<ComputeInstanceWizardValues>;
  breadcrumbParentLabel: string;
  initialCatalogItemId?: string;
  orderedSteps: readonly WizardStepId[];
  activeStepId: WizardStepId;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  provisionError?: string;
  setProvisionError: (message: string | undefined) => void;
  validationAlert: boolean;
  setValidationAlert: (visible: boolean) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
  showCancelConfirm: boolean;
  setShowCancelConfirm: (visible: boolean) => void;
  onProvision: Props['onProvision'];
  close: (options?: { notifyClosed?: boolean }) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

const CatalogProvisionWizardForm = ({
  adapter,
  formik,
  breadcrumbParentLabel,
  initialCatalogItemId,
  orderedSteps,
  activeStepId,
  activeIndex,
  setActiveIndex,
  provisionError,
  setProvisionError,
  validationAlert,
  setValidationAlert,
  pending,
  setPending,
  showCancelConfirm,
  setShowCancelConfirm,
  onProvision,
  close,
  t,
}: FormProps) => {
  const { data: catalogItems = [] } = adapter.useCatalogItems();
  const selectedCatalogItem = formik.values.catalogItemId
    ? (catalogItems.find((item) => item.id === formik.values.catalogItemId) ?? null)
    : null;

  const requestClose = useCallback(() => {
    if (pending) {
      return;
    }
    if (hasWizardUnsavedProgress(formik.values)) {
      setShowCancelConfirm(true);
      return;
    }
    close();
  }, [close, formik.values, pending, setShowCancelConfirm]);

  const handleStepChange = useCallback(
    (_event: MouseEvent<HTMLButtonElement>, currentStep: { index?: number }) => {
      if (currentStep.index != null) {
        setActiveIndex(currentStep.index - 1);
        setProvisionError(undefined);
        setValidationAlert(false);
      }
    },
    [setActiveIndex, setProvisionError, setValidationAlert],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending && !showCancelConfirm) {
        requestClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pending, requestClose, showCancelConfirm]);

  useEffect(() => {
    if (activeIndex >= orderedSteps.length) {
      setActiveIndex(Math.max(0, orderedSteps.length - 1));
    }
  }, [activeIndex, orderedSteps.length, setActiveIndex]);

  const deepLinkInitializedRef = useRef(false);

  // Deep-link create (/vms/create/:catalogItemId): apply catalog defaults once the item loads.
  useEffect(() => {
    if (deepLinkInitializedRef.current || !initialCatalogItemId) {
      return;
    }
    const item = catalogItems.find((entry) => entry.id === initialCatalogItemId);
    if (!item) {
      return;
    }
    deepLinkInitializedRef.current = true;
    void adapter.onCatalogItemSelected?.(item, formik);
  }, [adapter, catalogItems, formik, initialCatalogItemId]);

  return (
    <>
      {showCancelConfirm ? (
        <Modal
          variant="small"
          isOpen
          onClose={() => setShowCancelConfirm(false)}
          aria-labelledby="catalog-provision-wizard-cancel-title"
        >
          <ModalHeader
            title={t('catalogProvision.cancel.title')}
            titleIconVariant="warning"
            labelId="catalog-provision-wizard-cancel-title"
          />
          <ModalBody>{t('catalogProvision.cancel.body')}</ModalBody>
          <ModalFooter>
            <Button variant="link" onClick={() => setShowCancelConfirm(false)}>
              {t('catalogProvision.cancel.keepEditing')}
            </Button>
            <Button variant="primary" onClick={() => close()}>
              {t('catalogProvision.cancel.discard')}
            </Button>
          </ModalFooter>
        </Modal>
      ) : null}
      <section role="region" aria-label={t(adapter.ariaLabelKey)} data-ouia-component-id="catalog-provision-wizard">
        <Form>
          <Wizard
            navAriaLabel={t('catalogProvision.wizard.navAria', {
              title: t(adapter.wizardTitleKey),
            })}
            isVisitRequired
            height="100%"
            onStepChange={handleStepChange}
            header={
              <CatalogProvisionWizardHeader
                breadcrumbParentLabel={breadcrumbParentLabel}
                wizardTitle={t(adapter.wizardTitleKey)}
                onRequestClose={requestClose}
                pending={pending}
              />
            }
            footer={
              <WizardFooterWrapper>
                <CatalogProvisionWizardFooter
                  adapter={adapter}
                  formik={formik}
                  catalogItem={selectedCatalogItem}
                  orderedSteps={orderedSteps}
                  activeStepId={activeStepId}
                  setProvisionError={setProvisionError}
                  setValidationAlert={setValidationAlert}
                  pending={pending}
                  setPending={setPending}
                  onProvision={onProvision}
                  close={close}
                  requestClose={requestClose}
                />
              </WizardFooterWrapper>
            }
          >
            {orderedSteps.map((stepId) => (
              <WizardStep key={stepId} id={stepId} name={t(STEP_LABEL_KEYS[stepId])}>
                {activeStepId === stepId ? (
                  <WizardStepBody
                    adapter={adapter}
                    stepId={stepId}
                    catalogItem={selectedCatalogItem}
                    values={formik.values}
                    provisionError={provisionError}
                    validationAlert={validationAlert}
                  />
                ) : null}
              </WizardStep>
            ))}
          </Wizard>
        </Form>
      </section>
    </>
  );
};

export const CatalogProvisionWizard = ({
  kind: _kind = 'compute_instance',
  breadcrumbParentLabel,
  initialCatalogItemId,
  onProvision,
  onClosed,
}: Props) => {
  const adapter = useComputeInstanceAdapter();
  const initialValues = useMemo(() => {
    const values = adapter.getInitialValues(null);
    if (initialCatalogItemId) {
      values.catalogItemId = initialCatalogItemId;
    }
    return values;
  }, [adapter, initialCatalogItemId]);

  return (
    <CatalogProvisionWizardInner
      adapter={adapter}
      breadcrumbParentLabel={breadcrumbParentLabel}
      initialCatalogItemId={initialCatalogItemId}
      initialValues={initialValues}
      onProvision={onProvision}
      onClosed={onClosed}
    />
  );
};
