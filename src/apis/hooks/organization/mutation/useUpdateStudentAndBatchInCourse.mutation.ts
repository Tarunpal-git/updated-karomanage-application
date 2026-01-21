import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../services/axios.service';
import { apiUrls } from '../../../urls';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';

type UpdateStudentAndBatchPayload = {
  courseId: string;
  rollNo: string;
  studentStatus: string;
};

export const useUpdateStudentAndBatchInCourseMutation = () => {
  const { authUser, selectedOrganization } = useSelector((state: RootState) => state.auth);

  return useMutation({
    mutationFn: async (payload: UpdateStudentAndBatchPayload) => {
      console.log('🎓 === UPDATE STUDENT & BATCH IN COURSE API CALL ===');
      console.log('API URL:', apiUrls.organization.UPDATE_STUDENT_AND_BATCH_IN_COURSE);

      const mappedStatus =
        payload.studentStatus === 'inactive'
          ? 'inActive'
          : payload.studentStatus;

      const userCustomerName = authUser?.customerName
        ? (authUser?.lastName ? `${authUser.customerName} ${authUser.lastName}` : authUser.customerName)
        : '';

      const requestPayload = {
        user: {
          userCustomerId: authUser?.customerId || '',
          userCustomerName,
          userCustomerEmail: authUser?.customerEmail || '',
          // Role info is usually on selectedOrganization.role
          roleName: (selectedOrganization as any)?.role?.roleName || '',
          roleId: (selectedOrganization as any)?.role?.roleId || '',
          userEmployeeId: authUser?.employeeId || '',
        },
        customerId: selectedOrganization?.customerId || '',
        organizationId: selectedOrganization?.organizationId || '',
        courseId: payload.courseId,
        updatedStudent: {
          rollNo: payload.rollNo,
          studentStatus: mappedStatus,
        },
      };

      console.log('🎓 Payload:', JSON.stringify(requestPayload, null, 2));

      const data = await request({
        method: 'POST',
        url: apiUrls.organization.UPDATE_STUDENT_AND_BATCH_IN_COURSE,
        data: requestPayload,
      });

      console.log('🎓 API Response:', JSON.stringify(data, null, 2));
      console.log('🎓 === END UPDATE STUDENT & BATCH IN COURSE API CALL ===');

      return data;
    },
  });
};

