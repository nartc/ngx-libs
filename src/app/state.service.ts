import { Location, PlatformLocation } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LIBRARY_SUPPORT_DATA } from './libs.data';
import { getAllAngularVersionsFromLibrarySupportData } from './utils';

const ALL_ANGULAR_VERSIONS =
  getAllAngularVersionsFromLibrarySupportData(LIBRARY_SUPPORT_DATA);

@Injectable({ providedIn: 'root' })
export class StateService {
  allAngularVersions = ALL_ANGULAR_VERSIONS;
  // select 3 versions by default
  versionsToShow = signal(ALL_ANGULAR_VERSIONS.slice(0, 3));

  searchFilter = signal('');

  data = signal(LIBRARY_SUPPORT_DATA);

  filteredData = computed(() => {
    const searchFilter = this.searchFilter();
    const data = this.data();

    if (!searchFilter) return data;

    return data
      .filter((lib) => {
        return lib.name.toLowerCase().includes(searchFilter.toLowerCase());
      })
      .slice(0, 30); // always limit to 30 results
  });

  constructor() {
    effect(() => console.log('versionsToShow', this.versionsToShow()));
    effect(() => console.log('data', this.filteredData()));

    const location = inject(Location);
    const platformLocation = inject(PlatformLocation);

    // NOTE: set initial searchFilter based on the query params
    const url = new URL(platformLocation.href);
    if (url.searchParams.has('search')) {
      this.searchFilter.set(url.searchParams.get('search') || '');
    }

    effect(() => {
      const searchFilter = this.searchFilter();
      const params = new URLSearchParams();

      // NOTE: only update query params if searchFilter is truthy
      if (searchFilter.trim()) {
        params.set('search', searchFilter.trim());
      }

      location.replaceState('', params.toString());
    });
  }
}
