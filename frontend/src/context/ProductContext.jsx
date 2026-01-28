import React, {
  createContext,
  useContext,
  useReducer,
  useCallback
} from "react";
import api from "../api/axios";

/* =========================================================
   CONTEXT
========================================================= */
const ProductContext = createContext(null);

/* =========================================================
   INITIAL STATE
========================================================= */
const initialState = {
  items: [],
  loading: false,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  },
  filters: {
    q: "",
    category: "",
    condition: "",
    location: "",
    sort: "latest",
    minPrice: "",
    maxPrice: ""
  }
};

/* =========================================================
   REDUCER
========================================================= */
function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      };

    case "SET_PRODUCTS":
      return {
        ...state,
        items: action.payload?.items || [],
        pagination: action.payload?.pagination || state.pagination
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: initialState.filters
      };

    default:
      return state;
  }
}

/* =========================================================
   PROVIDER
========================================================= */
export function ProductProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */
  const fetchProducts = useCallback(
    async (overrides = {}) => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const params = {
          page: overrides.page ?? state.pagination.page,
          limit: overrides.limit ?? state.pagination.limit,
          ...state.filters,
          ...overrides
        };

        /* 🔥 REMOVE UI-ONLY / EMPTY FILTERS */
        if (!params.q) delete params.q;
        if (!params.category) delete params.category;
        if (!params.condition) delete params.condition;
        if (!params.location) delete params.location;

        if (params.minPrice === "" || params.minPrice === null)
          delete params.minPrice;
        if (params.maxPrice === "" || params.maxPrice === null)
          delete params.maxPrice;

        // 🔒 Always enforce public rule
        if (!params.status) {
          params.status = "Available";
        }

        const res = await api.get("/api/products", { params });

        dispatch({
          type: "SET_PRODUCTS",
          payload: res.data.data
        });

        return res.data.data;
      } catch (err) {
        console.error(
          "fetchProducts error:",
          err?.response?.data || err
        );
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.filters, state.pagination.page, state.pagination.limit]
  );

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */
  const value = {
    items: state.items,
    loading: state.loading,
    pagination: state.pagination,
    filters: state.filters,
    dispatch,
    fetchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return context;
};
