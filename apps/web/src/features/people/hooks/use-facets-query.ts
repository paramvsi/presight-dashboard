import { useQuery } from "@tanstack/react-query";
import { FacetsResponseSchema, type FacetsResponse } from "@presight/shared";
import { apiGet } from "@/lib/api";

export function useFacetsQuery() {
  return useQuery<FacetsResponse>({
    queryKey: ["facets"],
    queryFn: ({ signal }) => apiGet("/facets", FacetsResponseSchema, { signal }),
    staleTime: 5 * 60_000,
  });
}
