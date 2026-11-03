import axios from "axios";

const activityApi = axios.create({
    baseURL: "http://localhost:8082",
    headers: {
        "Content-Type": "application/json",
    },
});

export const getActivities = () =>
    activityApi.get("/activities");

export const getActivityById = (id) =>
    activityApi.get(`/activities/${id}`);

export const createActivity = (data) =>
    activityApi.post("/activities", data);

export const updateActivity = (id, data) =>
    activityApi.put(`/activities/${id}`, data);

export const deleteActivity = (id) =>
    activityApi.delete(`/activities/${id}`);

export default activityApi;