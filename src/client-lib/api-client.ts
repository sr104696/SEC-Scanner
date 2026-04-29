import axios from "axios";
import useSWR, { mutate } from "swr";
import type { SecRequest, SecResponse } from "@/shared/sec-types";

export const apiClient = axios.create({
  baseURL: "/api",
});

const fetcher = <T>(url: string) => apiClient.get<T>(url).then((res) => res.data);

// One-shot extraction. We deliberately don't cache through SWR here — every
// request has different ticker/year inputs and there is no list view that
// would re-read the cache. The function is exported (not a hook) so the
// caller can drive its own loading/error UI.
export async function extractSecFinancials(params: SecRequest): Promise<SecResponse> {
  try {
    const { data } = await apiClient.post<SecResponse>("/sec-financials", params);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiMsg = (err.response?.data as { error?: string } | undefined)?.error;
      throw new Error(apiMsg ?? err.message);
    }
    throw err;
  }
}

// Re-exports kept for future hooks.
export { useSWR, mutate, fetcher };
