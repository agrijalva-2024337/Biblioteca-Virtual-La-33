import { axiosModeration } from './api';

// Todo requiere ADMIN_ROLE.
// status: PENDING | APPROVED | REJECTED
export const getModerations = async (params = {}) => {
  const { data } = await axiosModeration.get('/moderations', { params });
  return {
    moderations: data?.moderations ?? [],
    pagination: data?.pagination ?? null,
  };
};

export const getModerationById = async (id) => {
  const { data } = await axiosModeration.get(`/moderations/${id}`);
  return data?.moderation ?? data;
};

export const approveModeration = async (id) => {
  const { data } = await axiosModeration.patch(`/moderations/${id}/approve`);
  return data;
};

export const rejectModeration = async (id, reason) => {
  const { data } = await axiosModeration.patch(`/moderations/${id}/reject`, { reason });
  return data;
};
