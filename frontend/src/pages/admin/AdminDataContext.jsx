import { createContext, useContext, useState, useEffect } from "react";
import api from "../../api/apiClient";

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const [departments, setDepartments] = useState([]);
  const [hodMap, setHodMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/academic/departments");
      setDepartments(res.data);
      // Fetch HOD for each department
      const newHodMap = {};
      for (const d of res.data) {
        if (d.hod_faculty_id) {
          try {
            const hodRes = await api.get(`/academic/departments/${d.id}/hod`);
            if (hodRes.data && hodRes.data.name) {
              newHodMap[d.id] = hodRes.data;
            }
          } catch (err) {}
        }
      }
      setHodMap(newHodMap);
    } catch (err) {
      console.error("Failed to load departments.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <AdminDataContext.Provider value={{ departments, hodMap, fetchDepartments, loading }}>
        {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext);
}
