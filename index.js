const Recipes = [];
const Materials = [];
const RawMaterials = [];

const newRecipeName = document.getElementById("newRecipeName"),
  newRecipeCount = document.getElementById("newRecipeCount"),
  newRecipeMultiplier = document.getElementById("newRecipeMultiplier"),
  newRecipeClass = document.getElementById("newRecipeClass");

function ClearRecipeInput() {
  newRecipeName.value = "";
  newRecipeCount.value = "1";
  newRecipeMultiplier.value = "1";
  newRecipeClass.value = "";
}

const addRecipe = document.getElementById("addRecipe");
function AddRecipe() {
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

  // Save a reference to our new Element
  newRecipe.Element = newRecipeTemplate;

  document.getElementById("recipeList").appendChild(newRecipeTemplate);

  ClearRecipeInput();
}
addRecipe.addEventListener('click', AddRecipe);

function RemoveRecipe(recipe) {
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

function RemoveRecipeByElement(recipeElement) {
  if (!recipeElement) { return; }
  for (const thisRecipe of Recipes) {
    console.log(thisRecipe);
    if (thisRecipe.Element === recipeElement) {
      RemoveRecipe(thisRecipe);
      break;
    }
  }
}

function onRemoveRecipe(event) {
  if (!event || !event.target) { return; }
  RemoveRecipeByElement(event.target.parentNode.parentNode);
}