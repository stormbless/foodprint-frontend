import axios, { type AxiosResponse, AxiosError } from "axios";


// attach cookies with access and refresh token (both jwt) to all requests
axios.defaults.withCredentials = true;

type FlexibleObject = {
  [key: string]: unknown;
};

const backend = {
  api: async (method: string, path: string, params?: FlexibleObject): Promise<AxiosResponse<any, any, {}>> => {
    const config: FlexibleObject = {
      baseURL: import.meta.env.VITE_BACKEND_URL,
      url: path,
      method     
    };
    if (method === "get") {
      config.params = params;
    } else {
      config.data = params;
    }
    
    return await axios(config);
  },
  refreshAccessToken: async () => {
    const response = await backend.api("post", "/api/refresh-token");
    console.log("refreshed access token");
    return response;
  },
  // send request to backend but refreshes access token and retries request if access token invalid
  apiWithRefresh: async (method: string, path: string, params?: FlexibleObject): Promise<AxiosResponse<any, any, {}>> => {
    try {
      return await backend.api(method, path, params);
    } catch (error) {
      const axiosError = error as AxiosError;

      // if access token expired/invalid (backend will send status 401)
      if (axiosError.status === 401) {
        console.log("access token invalid");
        // refresh access token
        await backend.refreshAccessToken(); // if refresh token is expired/invalid, 401 will be sent back and error will be thrown
        // retry request with new token
        return await backend.api(method, path, params);
      } else {
        // if some other error rethrow error
        throw axiosError;
      }
    }
  },
  get: async (path: string, params?: FlexibleObject): Promise<AxiosResponse<any, any, {}>> => {
    const response = await backend.apiWithRefresh("get", path, params);
    return response;
  },
  post: async (path: string, params?: FlexibleObject): Promise<AxiosResponse<any, any, {}>> => {
    const response = await backend.apiWithRefresh("post", path, params);
    return response;
  }
}

export default backend;