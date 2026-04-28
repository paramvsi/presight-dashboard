import { create } from "zustand";

type FiltersState = {
  search: string;
  hobbies: string[];
  nationalities: string[];
  setSearch: (v: string) => void;
  toggleHobby: (v: string) => void;
  toggleNationality: (v: string) => void;
  clear: () => void;
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export const useFiltersStore = create<FiltersState>((set) => ({
  search: "",
  hobbies: [],
  nationalities: [],
  setSearch: (search) => set({ search }),
  toggleHobby: (v) => set((s) => ({ hobbies: toggle(s.hobbies, v) })),
  toggleNationality: (v) => set((s) => ({ nationalities: toggle(s.nationalities, v) })),
  clear: () => set({ search: "", hobbies: [], nationalities: [] }),
}));

export const selectSearch = (s: FiltersState) => s.search;
export const selectHobbies = (s: FiltersState) => s.hobbies;
export const selectNationalities = (s: FiltersState) => s.nationalities;
