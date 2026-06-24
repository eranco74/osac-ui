import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

import { vmCatalogItem } from './fixtures';

export const selectCatalogItem = async (user: UserEvent, title = vmCatalogItem.title) => {
  await waitFor(() => {
    expect(screen.getAllByRole('radio', { name: title }).length).toBeGreaterThan(0);
  });
  const [radio] = screen.getAllByRole('radio', { name: title });
  await user.click(radio);
};

export const clickWizardNext = async (user: UserEvent) => {
  const [nextButton] = screen.getAllByRole('button', { name: 'Next' });
  await user.click(nextButton);
};

export const clickWizardBack = async (user: UserEvent) => {
  const [backButton] = screen.getAllByRole('button', { name: 'Back' });
  await user.click(backButton);
};

export const clickWizardCancel = async (user: UserEvent) => {
  const [cancelButton] = screen.getAllByRole('button', { name: 'Cancel' });
  await user.click(cancelButton);
};

export const fillGeneralStep = async (user: UserEvent, name: string, sshKey?: string) => {
  const nameInput = screen.getByLabelText(/^Name/);
  await user.clear(nameInput);
  await user.type(nameInput, name);
  if (sshKey !== undefined) {
    const sshInput = screen.getByLabelText(/SSH public key/);
    await user.clear(sshInput);
    await user.type(sshInput, sshKey);
  }
};

export const advanceToGeneralStep = async (user: UserEvent) => {
  await selectCatalogItem(user);
  await clickWizardNext(user);
  await waitFor(() => {
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
  });
};

export const advanceToConfigurationStep = async (user: UserEvent, vmName = 'web-01') => {
  await advanceToGeneralStep(user);
  await fillGeneralStep(user, vmName);
  await clickWizardNext(user);
  await waitFor(() => {
    expect(screen.getByLabelText(/VM image/)).toBeInTheDocument();
  });
};

export const fillConfigurationStep = async (
  user: UserEvent,
  imageRef = 'quay.io/example/rhel9',
) => {
  const imageInput = screen.getByLabelText(/VM image/);
  await user.clear(imageInput);
  await user.type(imageInput, imageRef);
};

export const advanceToNetworkingStep = async (user: UserEvent) => {
  await advanceToConfigurationStep(user);
  await clickWizardNext(user);
  await waitFor(() => {
    expect(screen.getByLabelText(/^Virtual network/)).toBeInTheDocument();
  });
};

export const selectNetworkingPickers = async (user: UserEvent) => {
  await waitFor(() => {
    expect(screen.getByLabelText(/^Virtual network/)).not.toBeDisabled();
  });

  const vnSelect = screen.getByLabelText(/^Virtual network/);
  await user.selectOptions(vnSelect, 'vn-1');

  await waitFor(() => {
    expect(screen.getByLabelText(/^Subnet/)).not.toBeDisabled();
  });
  await user.selectOptions(screen.getByLabelText(/^Subnet/), 'subnet-1');

  await waitFor(() => {
    expect(screen.getByLabelText(/^Security group/)).not.toBeDisabled();
  });
  await user.selectOptions(screen.getByLabelText(/^Security group/), 'sg-1');
};

export const advanceToReviewStep = async (user: UserEvent) => {
  await advanceToNetworkingStep(user);
  await selectNetworkingPickers(user);
  await clickWizardNext(user);
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review and create' })).toBeInTheDocument();
  });
};

export const expectValidationAlert = async () => {
  await waitFor(() => {
    expect(
      screen.getByText('Fix the highlighted errors before continuing.'),
    ).toBeInTheDocument();
  });
};

export const getCancelModal = () => {
  const dialog = screen.getByRole('dialog');
  return within(dialog);
};
