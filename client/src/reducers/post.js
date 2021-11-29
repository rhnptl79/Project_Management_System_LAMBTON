import { GET_POSTS, POST_ERRORS } from '../actions/types';

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};

const post = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_POSTS:
      return {
        ...state,
        posts: payload,
        loading: false,
      };
    case POST_ERRORS:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return { ...state };
  }
};

export default post;
