const Recipes = [];
const Materials = [];
const RawMaterials = [];

const newRecipeName = document.getElementById("newRecipeName"),
  newRecipeCount = document.getElementById("newRecipeCount"),
  newRecipeMultiplier = document.getElementById("newRecipeMultiplier"),
  newRecipeClass = document.getElementById("newRecipeClass");

function clearRecipeInput() {
  newRecipeName.value = "";
  newRecipeCount.value = "1";
  newRecipeMultiplier.value = "1";
  newRecipeClass.value = "";
}

const addRecipeButton = document.getElementById("addRecipe");
function addRecipe() {
  const newRecipe = {};
  newRecipe.Name = newRecipeName.value || "";
  newRecipe.Count = Number.parseInt(newRecipeCount.value) || 1;
  newRecipe.Completed = 0;
  newRecipe.Multiplier = Number.parseInt(newRecipeMultiplier.value) || 1;
  newRecipe.CraftCount = Math.ceil(newRecipe.Count/newRecipe.Multiplier);
  newRecipe.Class = newRecipeClass.value;
  newRecipe.Materials = [];

  console.log(newRecipe);
  Recipes.push(newRecipe);

  // Create Recipe List entry from template
  const recipeTemplate = document.getElementById("recipeTemplate");
  const newRecipeTemplate = recipeTemplate.content.firstElementChild.cloneNode(true);

  const templateFields = newRecipeTemplate.querySelectorAll(".recipe-field");
  console.log(templateFields);
  // Count
  templateFields[0].textContent = newRecipe.Count+"x";
  // Name
  templateFields[1].textContent = newRecipe.Name || "<CUSTOM>";
  // Completion
  templateFields[2].textContent = "("+Math.floor(newRecipe.Completed/newRecipe.Multiplier)+"/"+newRecipe.CraftCount+")";
  // Multiplier
  if (newRecipe.Multiplier === 1) {
    templateFields[3].style.display = "none";
  }
  templateFields[3].textContent = "("+newRecipe.Multiplier+"x/Craft)";
  // Class
  templateFields[4].textContent = newRecipe.Class;

  const removeButton = newRecipeTemplate.querySelector(".remove-button");
  removeButton.addEventListener('click', onRemoveRecipe);

  const haveInput = newRecipeTemplate.querySelector(".recipe-have");
  haveInput.addEventListener('change', (event) => { 
    newRecipe.Completed = Number.parseInt(event.target.value) || 0;
    updateRecipe(newRecipe); 
  })

  // Save a reference to our new Element
  newRecipe.Element = newRecipeTemplate;

  document.getElementById("recipeList").appendChild(newRecipeTemplate);

  clearRecipeInput();
}
addRecipeButton.addEventListener('click', addRecipe);

function removeRecipe(recipe) {
  for (let i=0; i < Recipes.length; i++) {
    const thisRecipe = Recipes[i];
    if (thisRecipe == recipe) {
      Recipes.splice(i, 1);
      if (thisRecipe.Element) {
        thisRecipe.Element.remove();
        thisRecipe.Element = null;
      }
    }
  }
}

function removeRecipeByElement(recipeElement) {
  if (!recipeElement) { return; }
  for (const thisRecipe of Recipes) {
    console.log(thisRecipe);
    if (thisRecipe.Element === recipeElement) {
      removeRecipe(thisRecipe);
      break;
    }
  }
}

function onRemoveRecipe(event) {
  if (!event || !event.target) { return; }
  removeRecipeByElement(event.target.parentNode.parentNode);
}

function updateRecipeElement(recipe) {
  const recipeFields = recipe.Element.querySelectorAll(".recipe-field");
  // Count
  recipeFields[0].textContent = recipe.Count+"x";
  // Name
  recipeFields[1].textContent = recipe.Name || "<CUSTOM>";
  // Completion
  recipeFields[2].textContent = "("+Math.floor(recipe.Completed/recipe.Multiplier)+"/"+recipe.CraftCount+")";
  // Multiplier
  if (recipe.Multiplier === 1) {
    recipeFields[3].style.display = "none";
  } else if (recipeFields[3].style.display === "none") {
    recipeFields[3].style.display = "block";
  }
  recipeFields[3].textContent = "("+recipe.Multiplier+"x/Craft)";
  // Class
  recipeFields[4].textContent = recipe.Class;

  // Have
  const haveInput = recipe.Element.querySelector(".recipe-have");
  haveInput.value = recipe.Completed;
}

function updateRecipe(recipe) {
  updateRecipeElement(recipe);
}
