import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../../../services/contactService';

const DEPT_KEYS = {
  all: ['departments'],
  list: (params) => ['departments', 'admin', params],
};

export function usePublicDepartments() {
  return useQuery({
    queryKey: ['departments', 'public'],
    queryFn: async () => (await contactService.getContactDepartments()).data,
    select: (res) => res?.data?.departments ?? [],
  });
}

export function useAdminDepartments(params) {
  return useQuery({
    queryKey: DEPT_KEYS.list(params),
    queryFn: async () => (await contactService.getAllDepartments(params)).data,
    select: (res) => res?.data?.departments ?? [],
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => contactService.createDepartment(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPT_KEYS.all }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => contactService.updateDepartment(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPT_KEYS.all }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactService.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPT_KEYS.all }),
  });
}



