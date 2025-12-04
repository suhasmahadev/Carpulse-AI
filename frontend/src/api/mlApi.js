
import { apiRequest } from "./apiClient";
import axios from "axios";
export async function predictCost(token, mileage, experienceYears, partsCost) {
  const res = await axios.post(
    `${API_BASE_URL}/predict-cost`,
    {
      mileage,
      experience_years: experienceYears,
      parts_cost: partsCost
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
}
