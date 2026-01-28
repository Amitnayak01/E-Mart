import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const FavoriteContext = createContext(null);

const initialState = {
  ids: []
};

const FAV_KEY = "emart_fav_ids";

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_IDS":
      return { ...state, ids: action.payload };
    case "ADD_ID":
      if (state.ids.includes(action.payload)) return state;
      return { ...state, ids: [action.payload, ...state.ids] };
    case "REMOVE_ID":
      return { ...state, ids: state.ids.filter((x) => x !== action.payload) };
    case "CLEAR":
      return { ...state, ids: [] };
    default:
      return state;
  }
}

export function FavoriteProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load initially from localStorage
  useEffect(() => {
    const ids = safeParse(localStorage.getItem(FAV_KEY) || "[]") || [];
    dispatch({ type: "SET_IDS", payload: ids });
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(state.ids));
  }, [state.ids]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== FAV_KEY) return;
      const ids = safeParse(e.newValue || "[]") || [];
      dispatch({ type: "SET_IDS", payload: ids });
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const count = useMemo(() => state.ids.length, [state.ids]);

  const value = {
    ids: state.ids,
    count,
    setAll: (ids) => dispatch({ type: "SET_IDS", payload: ids || [] }),
    add: (id) => dispatch({ type: "ADD_ID", payload: id }),
    remove: (id) => dispatch({ type: "REMOVE_ID", payload: id }),
    clear: () => dispatch({ type: "CLEAR" })
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export const useFavorites = () => useContext(FavoriteContext);
