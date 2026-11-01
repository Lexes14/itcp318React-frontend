import axios from "axios";
import { API_URL } from "../config.js";
import { getToken } from "../Utils/helpers.jsx";

export const orderCreateRequest = () => ({ type: "ORDER_CREATE_REQUEST" });
export const orderCreateSuccess = (order) => ({
  type: "ORDER_CREATE_SUCCESS",
  payload: order,
});
export const orderCreateFail = (message) => ({
  type: "ORDER_CREATE_FAIL",
  payload: message,
});

export const createOrder = (orderData) => async (dispatch) => {
  dispatch(orderCreateRequest());
  try {
    const { data } = await axios.post(`${API_URL}/order/new`, orderData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    dispatch(orderCreateSuccess(data.order));
    return data.order;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Unable to place order";
    dispatch(orderCreateFail(message));
    throw error;
  }
};
