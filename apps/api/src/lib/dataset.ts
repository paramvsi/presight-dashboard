import { faker } from "@faker-js/faker";
import type { FacetItem, FacetsResponse, PeoplePage, PeopleQuery, Person } from "@presight/shared";
import { HOBBIES } from "@/lib/hobbies";

type DatasetState = {
  people: Person[];
  facets: FacetsResponse;
};

let state: DatasetState | null = null;

function pickHobbies(): string[] {
  const count = faker.number.int({ min: 0, max: 10 });
  if (count === 0) return [];
  return faker.helpers.arrayElements(HOBBIES, count);
}

export function generatePeople(size: number, seed: number): Person[] {
  faker.seed(seed);
  const people: Person[] = new Array(size);
  for (let i = 0; i < size; i++) {
    const id = faker.string.uuid();
    people[i] = {
      id,
      avatar: faker.image.avatar(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 90 }),
      nationality: faker.location.country(),
      hobbies: pickHobbies(),
    };
  }
  return people;
}

function computeFacets(people: Person[]): FacetsResponse {
  const hobbyCounts = new Map<string, number>();
  const nationalityCounts = new Map<string, number>();

  for (const p of people) {
    nationalityCounts.set(p.nationality, (nationalityCounts.get(p.nationality) ?? 0) + 1);
    for (const h of p.hobbies) hobbyCounts.set(h, (hobbyCounts.get(h) ?? 0) + 1);
  }

  const top = (m: Map<string, number>): FacetItem[] =>
    [...m.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .slice(0, 20);

  return { topHobbies: top(hobbyCounts), topNationalities: top(nationalityCounts) };
}

export function initDataset(size: number, seed: number) {
  const people = generatePeople(size, seed);
  state = { people, facets: computeFacets(people) };
  return state;
}

function getState(): DatasetState {
  if (!state) throw new Error("dataset not initialized");
  return state;
}

export function getFacets(): FacetsResponse {
  return getState().facets;
}

export function queryPeople(q: PeopleQuery): PeoplePage {
  const { people } = getState();
  const search = q.search?.toLowerCase().trim();
  const nationalities = q.nationalities && q.nationalities.length > 0 ? new Set(q.nationalities) : null;
  const hobbies = q.hobbies && q.hobbies.length > 0 ? new Set(q.hobbies) : null;

  const filtered: Person[] = [];
  for (const p of people) {
    if (search) {
      const fn = p.first_name.toLowerCase();
      const ln = p.last_name.toLowerCase();
      if (!fn.startsWith(search) && !ln.startsWith(search)) continue;
    }
    if (nationalities && !nationalities.has(p.nationality)) continue;
    if (hobbies) {
      let any = false;
      for (const h of p.hobbies) {
        if (hobbies.has(h)) {
          any = true;
          break;
        }
      }
      if (!any) continue;
    }
    filtered.push(p);
  }

  const total = filtered.length;
  const start = (q.page - 1) * q.pageSize;
  const items = filtered.slice(start, start + q.pageSize);
  return {
    items,
    page: q.page,
    pageSize: q.pageSize,
    total,
    hasMore: start + items.length < total,
  };
}
