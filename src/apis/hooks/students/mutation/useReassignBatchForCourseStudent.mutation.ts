import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../services/axios.service';
import { studentUrls } from '../../../urls/students.url';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';

interface ReassignBatchPayload {
  rollNo: string;
  courseId: string;
  newBatchId: string;
  oldBatchId: string;
}

export const useReassignBatchForCourseStudentMutation = () => {
  const { authUser, selectedOrganization } = useSelector((state: RootState) => state.auth);

  return useMutation({
    mutationFn: async (payload: ReassignBatchPayload) => {
      const user = authUser;
      const org = selectedOrganization;

      const requestPayload = {
        user: {
          userCustomerId: user?.customerId || '',
          userCustomerName: `${user?.customerName || ''} ${user?.lastName || ''}`.trim(),
          userCustomerEmail: user?.customerEmail || '',
          roleName: org?.role?.roleName || '',
          roleId: org?.role?.roleId || '',
          userEmployeeId: '', // backend example also keeps this empty
        },
        customerId: org?.customerId || '',
        organizationId: org?.organizationId || '',
        rollNo: payload.rollNo,
        courseId: payload.courseId,
        newBatchId: payload.newBatchId,
        oldBatchId: payload.oldBatchId,
      };

      const response = await request({
        method: 'POST',
        url: studentUrls.REASSIGN_BATCH_FOR_COURSE_STUDENT,
        data: requestPayload,
      });

      return response;
    },
  });
};

