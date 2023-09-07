import axios from 'axios';

const apiInstance = axios.create({
  baseURL: 'http://localhost:4000',
});

export function getSicks(param: string) {
  return apiInstance
    .get('/sick', {
      params: {
        q: param,
      },
    })
    .then(res => res.data)
    .catch(() => {
      return [];
    });
}
