import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../../../services/contactService';

const FAQ_KEYS = {
  all: ['faqs'],
  list: (params) => ['faqs', 'list', params],
  adminList: (params) => ['faqs', 'admin', params],
  detail: (id) => ['faqs', id],
};

export function usePublicFaqs(params) {
  return useQuery({
    queryKey: FAQ_KEYS.list(params),
    queryFn: async () => (await contactService.getContactFAQs(params)).data,
    select: (res) => res?.data?.faqs ?? [],
  });
}

export function useAdminFaqs(params) {
  return useQuery({
    queryKey: FAQ_KEYS.adminList(params),
    queryFn: async () => (await contactService.getAllFAQs(params)).data,
    select: (res) => res?.data?.faqs ?? [],
  });
}

export function useCreateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => contactService.createFAQ(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
}

export function useUpdateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => contactService.updateFAQ(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
}

export function useDeleteFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactService.deleteFAQ(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
}

export function useRateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, helpful }) => contactService.rateFAQ(id, helpful),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
}



