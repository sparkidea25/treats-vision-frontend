import { io } from 'socket.io-client';
import { ApiStrings } from './apiStrings';
// import { API_BASE_URL } from '../utils/constants';

export default io(ApiStrings.API_BASE_URL!, {
  autoConnect: true
});