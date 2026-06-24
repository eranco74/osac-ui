import { describe, expect, it } from 'vitest';

import type { CatalogFieldDefinition } from '../catalogFieldDefinition';

import { findCatalogFieldDefinition, getCatalogFieldOverlay } from './catalogOverlay';

const definitions: CatalogFieldDefinition[] = [
  {
    path: 'boot_disk.size_gib',
    displayName: 'Boot disk (GiB)',
    editable: true,
    default: 40,
  },
  {
    path: 'image.source_ref',
    displayName: 'Image reference',
    editable: true,
    default: 'quay.io/containerdisks/fedora:latest',
  },
];

describe('findCatalogFieldDefinition', () => {
  it('matches spec-relative API paths when the wizard queries with a spec. prefix', () => {
    expect(findCatalogFieldDefinition('spec.boot_disk.size_gib', definitions)?.path).toBe(
      'boot_disk.size_gib',
    );
    expect(findCatalogFieldDefinition('spec.image.source_ref', definitions)?.path).toBe(
      'image.source_ref',
    );
  });

  it('matches when query and definition use the same path form', () => {
    expect(findCatalogFieldDefinition('boot_disk.size_gib', definitions)?.default).toBe(40);
  });
});

describe('getCatalogFieldOverlay', () => {
  it('returns catalog defaults for spec-prefixed wizard paths', () => {
    const overlay = getCatalogFieldOverlay(
      'spec.boot_disk.size_gib',
      definitions,
      'Boot disk (GiB)',
    );

    expect(overlay.defaultValue).toBe(40);
    expect(overlay.label).toBe('Boot disk (GiB)');
  });
});
