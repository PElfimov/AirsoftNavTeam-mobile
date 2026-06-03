import axios, {AxiosInstance, CreateAxiosDefaults} from 'axios';

let internalAxiosInstance: AxiosInstance | null = null;

export const setupAxiosInstance = (config: CreateAxiosDefaults) => {
    internalAxiosInstance = axios.create({...config});
};

setupAxiosInstance({});

export const axiosInstance = (): AxiosInstance => {
    if (internalAxiosInstance === null) {
        throw new Error('You should setup axios instance');
    }

    return internalAxiosInstance;
};
