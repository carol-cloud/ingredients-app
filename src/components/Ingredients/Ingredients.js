import React, { useEffect, useCallback, useReducer, useMemo } from "react";
import ErrorModal from "../UI/ErrorModal";
import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("Should not get there!");
  }
};

const httpReducer = (currHttpState, action) => {
  switch(action.type) {
    case 'SEND':
      return { loading: true, error: null};
      case'RESPONSE':
      return {...currHttpState, loading: false};
      case 'ERROR':
        return { loading: false, error: action.errorMessage};
      case 'CLEAR':
        return {...currHttpState, error: null};
      default: 
        throw new Error('Shoul not be reached');
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    fetch(
      "https://react-hooks-update-750f8-default-rtdb.firebaseio.com/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }
        // setUserIngredients(loadedIngredients);
      });
  }, []);

  useEffect(() => {
    console.log("Rendering ingredients", userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients})
  }, []);

  const addIngredientHandler = (ingredient) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      "https://react-hooks-update-750f8-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "Application/json" },
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then((responseData) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient },
        // ]);
        dispatch({type: 'ADD', ingredient: { id: responseData.name, ...ingredient } })
      });
  };

  const removeIngredientHandler = useCallback(ingredientId => {
    dispatchHttp({type: 'SEND'});
    fetch(
      `https://react-hooks-update-750f8-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE", 
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
        // );
        dispatch({type: 'DELETE', id: ingredientId})
      })
      .catch((error) => {
        dispatchHttp({type: 'ERROR', errorMessage: 'Somenthing went wrong!'});
      });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({type: 'CLEAR'});
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        ></IngredientList>
    )
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm
        loading={httpState.loading}
        onAddIngredient={addIngredientHandler}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
