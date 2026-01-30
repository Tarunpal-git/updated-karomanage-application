import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../services/axios.service';
import { apiUrls } from '../../../urls';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
 
export const useUpdateStudentMutation = () => {
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const selectedOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);

  return useMutation({
    mutationFn: async (payload: any) => {
      console.log('📝 === UPDATE STUDENT API CALL ===');
      console.log('API URL:', apiUrls.student.UPDATE_STUDENT);
      
      // Build user object from authUser and selectedOrganization
      const userCustomerName = authUser?.customerName 
        ? (authUser?.lastName ? `${authUser.customerName} ${authUser.lastName}` : authUser.customerName)
        : '';
      
      const userObject = {
        userCustomerId: authUser?.customerId || '',
        userCustomerName: userCustomerName,
        userCustomerEmail: authUser?.customerEmail || '',
        roleName: selectedOrganization?.role?.roleName || '',
        roleId: selectedOrganization?.role?.roleId || '',
        userEmployeeId: authUser?.employeeId || '',
      };
      
      // Build the new payload structure
      console.log('🔧 === MUTATION: BUILDING API PAYLOAD ===');
      console.log('🔧 Received payload.dateOfAdmission:', payload.dateOfAdmission);
      console.log('🔧 Received payload.studentDateOfBirth:', payload.studentDateOfBirth);
      
      // Only include dateOfAdmission if it's actually provided (not undefined)
      // This prevents clearing the date if backend doesn't return it
      const updatePayload: any = {
        user: userObject,
        customerId: selectedOrganization?.customerId || '',
        rollNo: payload.rollNo || '',
        organizationId: selectedOrganization?.organizationId || '',
        studentFirstName: payload.studentFirstName || '',
        studentLastName: payload.studentLastName || '',
        studentEnrollmentNumber: payload.studentEnrollmentNumber || payload.enrollmentNumber || '',
        studentEmail: payload.studentEmail || '',
        studentDateOfBirth: payload.studentDateOfBirth || null,
        studentCourse: payload.studentCourse || payload.collegeCourse || '',
        studentCollage: payload.studentCollage || payload.collegeName || '',
        studentSemester: payload.studentSemester || payload.collegeSemester || '',
        studentContact: payload.studentContact || '',
        studentFatherName: payload.studentFatherName || '',
        studentFatherContact: payload.studentFatherContact || '',
        studentAddress: payload.studentAddress || '',
        studentGender: payload.studentGender || '',
        studentDepartmentName: payload.studentDepartmentName || payload.departmentName || '',
        studentImage: payload.studentImage || '',
        studentDynamicFields: payload.studentDynamicFields || [],
      };
      
      // Only add dateOfAdmission if it's explicitly provided (not undefined)
      // This way, if backend doesn't return it, we don't accidentally clear it
      if (payload.dateOfAdmission !== undefined) {
        updatePayload.dateOfAdmission = payload.dateOfAdmission || null;
      }
      
      console.log('🔧 === FINAL API PAYLOAD ===');
      console.log('🔧 Full Payload:', JSON.stringify(updatePayload, null, 2));
      console.log('🔧 dateOfAdmission in API payload:', updatePayload.dateOfAdmission);
      console.log('🔧 studentDateOfBirth in API payload:', updatePayload.studentDateOfBirth);
      
      const data = await request({
        method: 'POST',
        url: apiUrls.student.UPDATE_STUDENT,
        data: updatePayload,
      });
      
      console.log('📝 API Response:', JSON.stringify(data, null, 2));
      console.log('📝 === END UPDATE STUDENT API CALL ===');
      
      return data;
    }
  });
};
