import axios from 'axios';


export const HOST = 'localhost:8080';
const BASE_URL = `http://${HOST}/api/`;
const BASE_URL_PLUGIN = `http://${HOST}/plugin/`;


export const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pluginDownloadClient = axios.create({
  baseURL: BASE_URL_PLUGIN,
  timeout: 10000,
});
