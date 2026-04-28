import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { PeoplePageSchema, type PeoplePage } from "@presight/shared";
import { apiGet } from "@/lib/api";

const PAGE_SIZE = 30;

type Args = { search: string; hobbies: string[]; nationalities: string[] };

export function usePeopleQuery({ search, hobbies, nationalities }: Args) {
  return useInfiniteQuery<PeoplePage>({
    queryKey: ["people", { search, hobbies, nationalities }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      apiGet("/people", PeoplePageSchema, {
        signal,
        query: {
          page: pageParam as number,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          hobbies: hobbies.length ? hobbies : undefined,
          nationalities: nationalities.length ? nationalities : undefined,
        },
      }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}
