import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const key = (Math.random() + 1).toString(36).substring(7);
  http.get(`http://kv-store.dev:3000/${key}`);
  sleep(1);
}