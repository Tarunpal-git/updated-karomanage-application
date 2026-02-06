import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

const get = async () => {
  const response = await request({
    url: apiUrls.course.FETCH_COURSES_LIST_NEW,
    method: "GET",
    // New endpoint: /organizationDetails*/listCourses?customerId=...&organizationId=...
    // customerId and organizationId are automatically added by axios interceptor
  });
  return response;
};

export const useCourseListsQuery = () => {
  return useQuery({
    queryKey: [apiUrls.course.FETCH_COURSES_LIST_NEW],
    queryFn: get,
  });
};
