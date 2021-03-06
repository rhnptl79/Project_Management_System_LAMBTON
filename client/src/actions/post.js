import axios from 'axios';
import { setAlert } from './alert';
import { GET_POSTS, POST_ERRORS } from './types';

// GET posts
export const getPosts = () => async (dispatch) => {
  try {
    const res = await axios.get(`/api/posts`);
    dispatch({
      type: GET_POSTS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: POST_ERRORS,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};
